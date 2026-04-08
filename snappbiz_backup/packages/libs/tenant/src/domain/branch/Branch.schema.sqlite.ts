import { sqliteTable, text, uniqueIndex, integer, index } from "drizzle-orm/sqlite-core";

import { timestamps } from "../../helper/schemas/timestamp.column.helper";
import { companyTable } from "../company/Company.schema.sqlite";

export const branchTable = sqliteTable('branch', {
    id: integer('id', { mode: 'number' }),
    code: text('code', { mode: 'text' }).notNull(),
    companyId: text('company_id', { mode: 'text' }).notNull().references(() => companyTable.id),
    name: text('name', { mode: 'text' }).notNull(),
    address: text('address', { mode: 'json' }),
    phoneNumber: text('phone_number', { mode: 'text' }),
    email: text('email', { mode: 'text' }),
    externalId: text('external_id', { mode: 'text' }),
    ...timestamps
}, (table) => {
    return {
        codeIdx: uniqueIndex("branch_code_idx").on(table.code),
        companyIdIdx: index("branch_company_id_idx").on(table.companyId),
        externalIdIdx: index("branch_external_id_idx").on(table.externalId),
    };
});

