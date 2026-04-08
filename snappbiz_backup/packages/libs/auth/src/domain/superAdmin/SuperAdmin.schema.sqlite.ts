import { sql } from "drizzle-orm";
import { text, sqliteTable, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

import { timestamps } from "../../helper/schemas/timestamp.column.helper";

export const superAdminTable = sqliteTable('super_admin', {
    id: text('id', { mode: 'text' }).primaryKey(),
    username: text('username', { mode: 'text' }).notNull().unique(),
    email: text('email', { mode: 'text' }).notNull().unique(),
    passwordHash: text('password', { mode: 'text' }).notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps
}, (table) => {
    return {
        emailIsActiveIdx: uniqueIndex("super_admin_email_is_active_idx").on(table.email, table.isActive),
        usernameIsActiveIdx: uniqueIndex("super_admin_username_is_active_idx").on(table.username, table.isActive),
    };
});

export type SuperAdminTable = typeof superAdminTable.$inferSelect;