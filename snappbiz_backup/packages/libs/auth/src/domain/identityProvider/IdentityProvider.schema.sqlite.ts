import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { userLoginMethodTable } from "../loginMethod/UserLoginMethod.schema.sqlite";

import { timestamps } from "../../helper/schemas/timestamp.column.helper";

export const identityProviderTable = sqliteTable('identity_provider', {
    id: text('id', { mode: 'text' }).primaryKey(),
    name: text('name', { mode: 'text' }).notNull(),
    code: text('code', { mode: 'text' }).notNull(),
    clientId: text('client_id', { mode: 'text' }).notNull(),
    clientSecret: text('client_secret', { mode: 'text' }).notNull(),
    redirectUri: text('redirect_uri', { mode: 'text' }).notNull(),
    ...timestamps
}, (table) => {
    return {
        codeIdx: uniqueIndex("identity_provider_code_idx").on(table.code),
    };
})

export const identityProviderRelations = relations(identityProviderTable, ({ many }) => ({
    userLoginMethods: many(userLoginMethodTable, { relationName: "identity_provider_user_login_methods" }),
}))
