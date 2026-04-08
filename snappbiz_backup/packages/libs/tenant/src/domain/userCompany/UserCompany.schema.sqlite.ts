import { relations, sql } from "drizzle-orm";
import { text, sqliteTable, integer, index } from "drizzle-orm/sqlite-core";

import { companyTable } from "../company/Company.schema.sqlite";

// Enables a profile to belong to multiple companies, this function to make a persona for each companies
export const userCompanyTable = sqliteTable('user_company', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    userId: text('user_id', { mode: 'text' }).notNull(),
    companyId: text('company_id', { mode: 'text' }).notNull().references(() => companyTable.id), //references to companyTable will be handled in usecase
    role: text('role', { mode: 'text' }).notNull().default(sql`'user'`), // user mean customers, admin, super_admin
}, table => {
    return {
        userIdCompanyIdIdx: index("user_company_user_id_company_id_idx").on(table.userId, table.companyId),
    };
})

export const userCompanyRelation = relations(userCompanyTable, ({ one }) => ({
    company: one(companyTable, { fields: [userCompanyTable.companyId], references: [companyTable.id] })
}))
