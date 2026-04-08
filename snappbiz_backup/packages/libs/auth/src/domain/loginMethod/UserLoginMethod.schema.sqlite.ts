import { relations, sql } from "drizzle-orm";
import { text, sqliteTable, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

import { timestamps } from "../../helper/schemas/timestamp.column.helper";

import { userTable } from "../user/User.schema.sqlite";
import { identityProviderTable } from "../identityProvider/IdentityProvider.schema.sqlite";

export const userLoginMethodTable = sqliteTable('user_login_method', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    userId: text('user_id', { mode: 'text' }).notNull().references(() => userTable.id),
    method: text('method', { mode: 'text' }).notNull(), // email, phone_number, username, google, apple
    loginIdentifier: text('login_identifier', { mode: 'text' }).notNull(), // email, phone_number, username, or social ID value,
    passwordHash: text('password_hash', { mode: 'text' }), // different password hash for each method
    providerId: text('provider_id', { mode: 'text' }).references(() => identityProviderTable.id),
    isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(sql`0`),
    ...timestamps
}, table => {
    return {
        userIdIdx: index("user_login_method_user_id_idx").on(table.userId),
        methodLoginIdentifierIdx: uniqueIndex("user_login_method_login_identifier_idx").on(table.method, table.loginIdentifier),
        providerIdMethodIdx: uniqueIndex("user_login_method_provider_id_method_idx").on(table.providerId, table.method),
    };
})

export const userLoginMethodRelations = relations(userLoginMethodTable, ({ one }) => ({
    user: one(userTable, { fields: [userLoginMethodTable.userId], references: [userTable.id], relationName: "user_login_method" }),
    provider: one(identityProviderTable, { fields: [userLoginMethodTable.providerId], references: [identityProviderTable.id], relationName: "identity_provider_user_login_methods" }),
}))
