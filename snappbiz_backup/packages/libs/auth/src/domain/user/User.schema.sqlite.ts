import { relations, sql } from "drizzle-orm";
import { text, sqliteTable, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

import { timestamps } from "../../helper/schemas/timestamp.column.helper";

import { userReferralTable } from "../referral/UserReferral.schema.sqlite";
import { userLoginMethodTable } from "../loginMethod/UserLoginMethod.schema.sqlite";

export const userTable = sqliteTable('user', {
    id: text('id', { mode: 'text' }).primaryKey(),
    username: text('username', { mode: 'text' }).unique(),
    dateOfBirth: integer('date_of_birth', { mode: "timestamp" }),
    isAnonymous: integer('is_anonymous', { mode: 'boolean' }).notNull().default(false),
    fullName: text('full_name', { mode: 'text' }).notNull(),
    phoneNumber: text('phone_number', { mode: 'text' }).unique(),
    email: text('email', { mode: 'text' }).unique(),
    verifiedAt: integer('verified_at', { mode: "timestamp" }),
    referralCode: text('referral_code', { mode: 'text' }),
    ...timestamps
}, (table) => {
    return {
        referralCodeIdx: uniqueIndex("user_referral_code_idx").on(table.referralCode),
        phoneNumberIndex: index("user_phone_number_idx").on(table.phoneNumber),
        emailIdx: index("user_email_idx").on(table.email),
        usernameIdx: index("user_username_idx").on(table.username),
        dateOfBirthIdx: index("user_date_of_birth_idx").on(table.dateOfBirth),
    };
});

export const userRelations = relations(userTable, ({ many }) => ({
    referrers: many(userReferralTable, { relationName: 'user_referrer' }),
    referredUsers: many(userReferralTable, { relationName: 'user_referred' }),
    loginMethods: many(userLoginMethodTable, { relationName: 'user_login_method' }),
}))
