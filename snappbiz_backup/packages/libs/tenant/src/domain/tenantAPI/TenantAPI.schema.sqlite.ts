import { relations } from "drizzle-orm";
import { text, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";
import { tenantTable } from "../tenant/Tenant.schema.sqlite";

import { timestamps } from "../../helper/schemas/timestamp.column.helper";

export const tenantApiTable = sqliteTable('tenant_api', {
    id: text('id', { mode: 'text' }).primaryKey(),
    tenantId: text('tenant_id', { mode: 'text' }).notNull(),
    apiKey: text('api_key', { mode: 'text' }).notNull(),
    secretKey: text('secret_key', { mode: 'text' }).notNull(),
    ...timestamps
}, (table) => {
    return {
        apiKeyIdx: uniqueIndex("tenant_api_key_idx").on(table.apiKey),
        secretKeyIdx: uniqueIndex("tenant_api_secret_key_idx").on(table.secretKey),
    };
});

export const tenantApiRelations = relations(tenantApiTable, ({ one }) => ({
    tenant: one(tenantTable, {
        fields: [tenantApiTable.tenantId],
        references: [tenantTable.id],
        relationName: "tenant_tenant_apis"
    })
}));