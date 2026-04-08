import type { D1Database } from '@cloudflare/workers-types';
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1'

export class CloudflareD1DB {
    db: DrizzleD1Database;

    constructor(db: D1Database) {
        this.db = drizzle(db);
    }
}
