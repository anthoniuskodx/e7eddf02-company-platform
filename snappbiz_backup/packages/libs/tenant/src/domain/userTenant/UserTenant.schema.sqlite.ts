import { relations, sql } from "drizzle-orm";
import { text, sqliteTable, integer, index } from "drizzle-orm/sqlite-core";

import { tenantTable } from "../tenant/Tenant.schema.sqlite";

// Enables a user to belong to multiple tenants, work for 
export const userTenantTable = sqliteTable('user_tenant', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    userId: text('user_id', { mode: 'text' }).notNull(),
    tenantId: text('tenant_id', { mode: 'text' }).notNull().references(() => tenantTable.id),
    scope: text('scope', { mode: 'text' }).notNull().default(sql`'admin:all'`), // billing:all, admin:all, super_admin:all
}, table => {
    return {
        userIdTenantIdIdx: index("user_tenant_user_id_tenant_id_idx").on(table.userId, table.tenantId),
    };
})

export const userTenantRelation = relations(userTenantTable, ({ one }) => ({
    tenant: one(tenantTable, { fields: [userTenantTable.tenantId], references: [tenantTable.id] })
}))
