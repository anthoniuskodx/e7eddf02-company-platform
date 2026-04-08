import { text, sqliteTable, integer, index } from "drizzle-orm/sqlite-core";

import { userTable } from "../user/User.schema.sqlite";
import { relations } from "drizzle-orm";

export const userSecurityTable = sqliteTable('user_security', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    userId: text('user_id', { mode: 'text' }).notNull().references(() => userTable.id),
    retryCount: integer('retry_count', { mode: 'number' }).notNull().default(0),
    lastRetryAt: integer('last_retry_at', { mode: "timestamp" }),
    isLocked: integer('is_locked', { mode: 'boolean' }).notNull().default(false),
    lockUntil: integer('lock_until', { mode: "timestamp" }),
}, table => {
    return {
        userIdIdx: index("user_security_user_id_idx").on(table.userId),
    };
})

export const userSecurityRelations = relations(userSecurityTable, ({ one }) => ({
    user: one(userTable, { fields: [userSecurityTable.userId], references: [userTable.id] }),
}));
