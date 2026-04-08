import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

import { timestamps } from "../../helper/schemas/timestamp.column.helper";

import { userTable } from "../user/User.schema.sqlite";

export const userReferralTable = sqliteTable('user_referral', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    referrerId: text('referrer_id', { mode: 'text' }).notNull().references(() => userTable.id),
    referredId: text('referred_id', { mode: 'text' }).notNull().references(() => userTable.id),
    status: text('status', { mode: 'text' }).notNull().default(sql`'pending'`), // pending, approved, rejected by admin
    ...timestamps
}, table => {
    return {
        referrerIdIdx: index("user_referral_referrer_id_idx").on(table.referrerId),
        referredIdIdx: index("user_referral_referred_id_idx").on(table.referredId),
        referrerIdReferredIdIdx: uniqueIndex("user_referral_referrer_id_referred_id_idx").on(table.referrerId, table.referredId),
    };
})

export const referralUserRelation = relations(userReferralTable, ({ one }) => ({
    referrer: one(userTable, { fields: [userReferralTable.referrerId], references: [userTable.id], relationName: "user_referrer" }),
    referred: one(userTable, { fields: [userReferralTable.referredId], references: [userTable.id], relationName: "user_referred" }),
}))
