import { defineConfig } from 'drizzle-kit';
import { resolve } from 'path';
import { mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

export const getLocalD1DB = () => {
  try {
    const basePath = resolve('.wrangler', 'tenant', 'v3', 'd1');
    let entries;
    try {
      entries = readdirSync(basePath, { withFileTypes: true });
    } catch (err) {
      try {
        mkdirSync(basePath, { recursive: true });
      } catch (err) {
        console.error('Failed to create directory:', err);
      }
    }

    const miniflareDir = entries.find(
      (entry: any) =>
        entry.isDirectory() && entry.name === 'miniflare-D1DatabaseObject'
    );

    if (!miniflareDir) {
      try {
        mkdirSync(join(basePath, 'miniflare-D1DatabaseObject'), { recursive: true });
      } catch (err) {
        console.error('Failed to create directory:', err);
        throw new Error(`miniflare directory not found in ${basePath}`);
      }
    }

    const miniflarePathFull = join(basePath, miniflareDir.name);
    const files = readdirSync(miniflarePathFull, { withFileTypes: true });
    const dbFile = files.find((f) => f.isFile() && f.name.endsWith('.sqlite'));

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
};

export default defineConfig({
  schema: 'packages/libs/tenant/src/domain/**/*.schema.sqlite.ts',
  out: 'packages/libs/tenant/migrations',
  dialect: 'sqlite',
  ...(process.env['NODE_ENV'] === 'production'
    ? {
        driver: 'd1-http',
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
      }),
});
