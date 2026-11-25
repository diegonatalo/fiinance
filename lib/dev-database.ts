/**
 * Keeps dev, tests and migrations on this computer away from the production
 * database. Outside localhost, only a database whose name ends in `_dev` or
 * `_dev_test` passes: production's never does, and neither does whatever
 * `vercel env pull` brings. It never runs on the deployed site.
 *
 * Used by lib/db (only in `next dev`), drizzle.config.ts and playwright.config.ts.
 */

type Env = Record<string, string | undefined>;

const LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]", "::1"];
const DEV_NAME = /^[a-z0-9_]+_dev(_test)?$/;

const isDevUrl = (value: string) => {
  try {
    const url = new URL(value);
    // `?host=` wins over the hostname in pg, and is ignored by Neon's driver: check both
    const hosts = [url.hostname, ...url.searchParams.getAll("host")];
    if (hosts.every((host) => LOCAL_HOSTS.includes(host))) return true;
    return DEV_NAME.test(url.pathname.slice(1));
  } catch {
    return false;
  }
};

/**
 * Throws when one of the variables points at a database that is not for development.
 * The message never carries the URL, which has the password.
 */
export const assertDevDatabase = (env: Env, names = ["DATABASE_URL", "DATABASE_URL_UNPOOLED"]) => {
  const set = names.filter((name) => env[name]);
  const wrong = set.filter((name) => !isDevUrl(env[name] as string));
  // without a URL, pg connects to PGHOST
  if (set.length === 0 && env.PGHOST && !LOCAL_HOSTS.includes(env.PGHOST)) wrong.push("PGHOST");
  if (wrong.length === 0) return;
  throw new Error(
    `Banco recusado (${wrong.join(", ")}): não é um banco de desenvolvimento. ` +
      "Fora do localhost, o nome do banco precisa terminar em _dev ou _dev_test. " +
      "Confira o .env.local: ele pode estar apontando para a produção.",
  );
};

/**
 * Whether drizzle-kit is migrating inside a Vercel build. `hasEnvFile` matters because
 * `vercel env pull` writes VERCEL=1 to the .env.local, and a deploy never has that file.
 */
export const isVercelBuild = (env: Env, hasEnvFile: boolean) => Boolean(env.VERCEL) && !hasEnvFile;
