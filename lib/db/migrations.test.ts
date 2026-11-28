// @vitest-environment node
import { readFileSync } from "node:fs";
import path from "node:path";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/*
 * A migração 0001 calcula a posição de cada fundo a partir das operações da versão
 * anterior. Roda contra um Postgres de verdade (o service do CI), num schema próprio,
 * tudo dentro de uma transação desfeita no fim: nada fica no banco. O `SET LOCAL` vale
 * só para a transação; um `SET` comum ficaria na conexão do pooler do Neon e mandaria
 * as consultas do app para o schema do teste. Sem DATABASE_URL, é pulado.
 */

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
const schema = `migration_test_${Date.now().toString(36)}`;

const statements = (file: string) =>
  readFileSync(path.join(process.cwd(), "drizzle", file), "utf8")
    .replaceAll('"public".', `"${schema}".`)
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

describe.skipIf(!url)("migração 0001 (posição a partir das operações)", () => {
  const db = new Client({ connectionString: url });

  beforeAll(async () => {
    await db.connect();
    await db.query("BEGIN");
    await db.query(`CREATE SCHEMA "${schema}"`);
    await db.query(`SET LOCAL search_path TO "${schema}"`);
    for (const sql of statements("0000_init.sql")) await db.query(sql);

    await db.query(`INSERT INTO "user" (id, name, email) VALUES ('u', 'Pessoa', 'p@exemplo.test')`);
    await db.query(`
      INSERT INTO assets (user_id, id, ticker, type, segment) VALUES
        ('u', 'hglg', 'HGLG11', 'tijolo', 'logística'),
        ('u', 'knri', 'KNRI11', 'tijolo', 'lajes'),
        ('u', 'mxrf', 'MXRF11', 'papel', 'CDI'),
        ('u', 'xpml', 'XPML11', 'tijolo', 'shoppings'),
        ('u', 'novo', 'BTLG11', 'tijolo', 'híbrido')`);
    await db.query(`
      INSERT INTO transactions (user_id, id, asset_id, type, date, shares, price_cents) VALUES
        -- 10 a R$ 100 e 10 a R$ 120: 20 a R$ 110; vender 5 mantém o preço médio
        ('u', 't1', 'hglg', 'compra', '2026-01-10', 10, 10000),
        ('u', 't2', 'hglg', 'compra', '2026-02-10', 10, 12000),
        ('u', 't3', 'hglg', 'venda',  '2026-03-10', 5, 13000),
        -- zerou e comprou de novo: só a compra nova conta no preço médio
        ('u', 't4', 'knri', 'compra', '2026-01-10', 4, 15000),
        ('u', 't5', 'knri', 'venda',  '2026-02-10', 4, 16000),
        ('u', 't6', 'knri', 'compra', '2026-03-10', 2, 14000),
        -- preço médio com fração de centavo é arredondado: 3 a R$ 9,80 e 1 a R$ 9,81 = 9,8025
        ('u', 't7', 'mxrf', 'compra', '2026-01-10', 3, 980),
        ('u', 't8', 'mxrf', 'compra', '2026-01-11', 1, 981),
        -- vendeu tudo
        ('u', 't9', 'xpml', 'compra', '2026-01-10', 3, 10000),
        ('u', 't10', 'xpml', 'venda', '2026-02-10', 3, 11000)`);
    await db.query(`
      INSERT INTO payouts (user_id, id, asset_id, date, shares, total_cents) VALUES
        ('u', 'p1', 'hglg', '2026-02-15', 20, 2000),
        ('u', 'p2', 'hglg', '2026-03-15', 15, 1650),
        ('u', 'p3', 'mxrf', '2026-02-15', 4, 33)`);

    for (const sql of statements("0001_asset_snapshot.sql")) await db.query(sql);
  });

  afterAll(async () => {
    await db.query("ROLLBACK");
    await db.end();
  });

  const asset = async (id: string) => {
    const { rows } = await db.query(
      `SELECT segment, risk, shares, average_price_cents, last_dividend_hundredth_cents, rating FROM assets WHERE id = $1`,
      [id],
    );
    return rows[0];
  };

  it("vendas tiram cotas e mantêm o preço médio", async () => {
    expect(await asset("hglg")).toMatchObject({ shares: 15, average_price_cents: 11000 });
  });

  it("depois de zerar, só as compras novas contam", async () => {
    expect(await asset("knri")).toMatchObject({ shares: 2, average_price_cents: 14000 });
  });

  it("arredonda o preço médio para centavos", async () => {
    expect(await asset("mxrf")).toMatchObject({ shares: 4, average_price_cents: 980 });
  });

  it("fundo vendido e fundo sem operações ficam sem cotas", async () => {
    expect(await asset("xpml")).toMatchObject({ shares: 0, average_price_cents: 0 });
    expect(await asset("novo")).toMatchObject({ shares: 0, average_price_cents: 0 });
  });

  it("o último rendimento é o valor por cota do provento mais recente", async () => {
    // R$ 16,50 ÷ 15 = R$ 1,10; R$ 0,33 ÷ 4 = R$ 0,0825
    expect(await asset("hglg")).toMatchObject({ last_dividend_hundredth_cents: 11_000 });
    expect(await asset("mxrf")).toMatchObject({ last_dividend_hundredth_cents: 825 });
    expect(await asset("knri")).toMatchObject({ last_dividend_hundredth_cents: 0 });
  });

  it("renomeia os segmentos de tijolo e tira o indexador do papel", async () => {
    expect(await asset("hglg")).toMatchObject({ segment: "logístico" });
    expect(await asset("knri")).toMatchObject({ segment: "lajes corporativas" });
    expect(await asset("novo")).toMatchObject({ segment: "híbrido" });
    expect(await asset("mxrf")).toMatchObject({ segment: null, risk: null });
  });

  it("todo fundo começa com nota 5", async () => {
    const { rows } = await db.query(`SELECT DISTINCT rating FROM assets`);
    expect(rows).toEqual([{ rating: 5 }]);
  });
});
