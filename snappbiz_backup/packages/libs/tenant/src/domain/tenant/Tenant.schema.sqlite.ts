import { relations } from "drizzle-orm";
import { text, sqliteTable, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

import { timestamps } from "../../helper/schemas/timestamp.column.helper";

import { tenantApiTable } from "../tenantAPI/TenantAPI.schema.sqlite";
import { companyTable } from "../company/Company.schema.sqlite";

export const tenantTable = sqliteTable('tenant', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    code: text('code', { mode: 'text' }).notNull(),
    name: text('name', { mode: 'text' }).notNull(),
    ...timestamps
}, (table) => {
    return {
        codeIdx: uniqueIndex("tenant_code_idx").on(table.code),
    };
});

export const tenantRelations = relations(tenantTable, ({ many }) => ({
    tenantApis: many(tenantApiTable, { relationName: "tenant_tenant_apis" }),
    companies: many(companyTable, { relationName: "tenant_companies" })
}));
