ALTER TABLE "assets" ALTER COLUMN "segment" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "risk" text;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "shares" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "average_price_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "last_dividend_hundredth_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "rating" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
-- Posição de cada fundo a partir das operações, como lib/position.ts fazia: compras
-- refazem o preço médio, vendas só tiram cotas. Conta só o que veio depois da última
-- vez que a posição zerou.
WITH ordered AS (
  SELECT
    t.user_id,
    t.asset_id,
    t.type,
    t.shares,
    t.price_cents,
    ROW_NUMBER() OVER w AS n,
    SUM(CASE WHEN t.type = 'compra' THEN t.shares ELSE -t.shares END) OVER w AS running
  FROM "transactions" t
  WINDOW w AS (PARTITION BY t.user_id, t.asset_id ORDER BY t.date, t.created_at, t.id)
),
last_reset AS (
  SELECT user_id, asset_id, COALESCE(MAX(n) FILTER (WHERE running <= 0), 0) AS n0
  FROM ordered
  GROUP BY user_id, asset_id
),
position AS (
  SELECT
    o.user_id,
    o.asset_id,
    GREATEST(SUM(CASE WHEN o.type = 'compra' THEN o.shares ELSE -o.shares END), 0) AS shares,
    SUM(o.shares::numeric * o.price_cents) FILTER (WHERE o.type = 'compra')
      / NULLIF(SUM(o.shares) FILTER (WHERE o.type = 'compra'), 0) AS average_cents
  FROM ordered o
  JOIN last_reset r ON r.user_id = o.user_id AND r.asset_id = o.asset_id
  WHERE o.n > r.n0
  GROUP BY o.user_id, o.asset_id
)
UPDATE "assets" a
SET
  "shares" = p.shares,
  "average_price_cents" = CASE WHEN p.shares > 0 THEN ROUND(COALESCE(p.average_cents, 0)) ELSE 0 END
FROM position p
WHERE a.user_id = p.user_id AND a.id = p.asset_id;--> statement-breakpoint
-- Último rendimento: o valor por cota do provento mais recente de cada fundo.
UPDATE "assets" a
SET "last_dividend_hundredth_cents" = latest.value
FROM (
  SELECT DISTINCT ON (user_id, asset_id)
    user_id,
    asset_id,
    ROUND(total_cents::numeric * 100 / shares) AS value
  FROM "payouts"
  WHERE shares > 0
  ORDER BY user_id, asset_id, date DESC, created_at DESC
) latest
WHERE a.user_id = latest.user_id AND a.id = latest.asset_id;--> statement-breakpoint
-- Segmentos de tijolo com os nomes novos; papel deixa de ter segmento (IPCA/CDI) e
-- fica sem perfil de risco até a pessoa escolher.
UPDATE "assets" SET "segment" = CASE "segment"
  WHEN 'lajes' THEN 'lajes corporativas'
  WHEN 'logística' THEN 'logístico'
  ELSE "segment"
END
WHERE "type" = 'tijolo';--> statement-breakpoint
UPDATE "assets" SET "segment" = NULL WHERE "type" = 'papel';
