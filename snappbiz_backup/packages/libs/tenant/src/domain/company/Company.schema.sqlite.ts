import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, uniqueIndex, integer, index } from "drizzle-orm/sqlite-core";

import { timestamps } from "../../helper/schemas/timestamp.column.helper";
import { tenantTable } from "../tenant/Tenant.schema.sqlite";

export const companyTable = sqliteTable('company', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    code: text('code', { mode: 'text' }).notNull(),
    tenantId: text('tenant_id', { mode: 'text' }).notNull().references(() => tenantTable.id),
    name: text('name', { mode: 'text' }).notNull(),
    address: text('address', { mode: 'json' }),
    phoneNumber: text('phone_number', { mode: 'text' }),
    email: text('email', { mode: 'text' }),
    externalId: text('external_id', { mode: 'text' }),
    ...timestamps
}, (table) => {
    return {
        codeIdx: uniqueIndex("company_code_idx").on(table.code),
        tenantIdIdx: index("company_tenant_id_idx").on(table.tenantId),
        externalIdIdx: index("company_external_id_idx").on(table.externalId),
    };
});

export const companyRelations = relations(companyTable, ({ one }) => ({
    tenant: one(tenantTable, {
        fields: [companyTable.tenantId],
        references: [tenantTable.id],
        relationName: "tenant_companies"
    })
}));