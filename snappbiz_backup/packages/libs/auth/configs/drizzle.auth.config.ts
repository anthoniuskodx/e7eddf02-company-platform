import { defineConfig } from "drizzle-kit";
import { resolve } from "path";
import { readdirSync } from "fs";
import { join } from "path";

export const getLocalD1DB = () => {
    try {
        const basePath = resolve('.wrangler', 'auth', 'v3', 'd1');
        const entries = readdirSync(basePath, { withFileTypes: true });
        const miniflareDir = entries.find(entry => entry.isDirectory() && entry.name === 'miniflare-D1DatabaseObject');

        if (!miniflareDir) {
            throw new Error(`miniflare directory not found in ${basePath}`);
        }

        const miniflarePathFull = join(basePath, miniflareDir.name);
        const files = readdirSync(miniflarePathFull, { withFileTypes: true });
        const dbFile = files.find(f => f.isFile() && f.name.endsWith('.sqlite'));

        if (!dbFile) {
            throw new Error(`SQLite file not found in ${miniflarePathFull}`);
        }

        const url = join(miniflarePathFull, dbFile.name);
        console.log(`Using ${url}`);
        return `file:${url}`;
    } catch (err) {
        console.log(`Error: ${err}`);
        throw err;
    }
}

export default defineConfig({
  schema: "packages/libs/auth/src/domain/**/*.schema.sqlite.ts",
  out: "packages/libs/auth/migrations",
  dialect: "sqlite",
  ...(process.env['NODE_ENV'] === "production"
    ? {
      driver: "d1-http",
      dbCredentials: {
        accountId: process.env['CLOUDFLARE_ACCOUNT_ID']!,
        databaseId: process.env['CLOUDFLARE_DATABASE_ID']!,
        token: process.env['CLOUDFLARE_D1_TOKEN']!,
      },
    }
    : {
      dbCredentials: {
        url: getLocalD1DB(), // Placeholder, will be replaced
      },
    })
})
