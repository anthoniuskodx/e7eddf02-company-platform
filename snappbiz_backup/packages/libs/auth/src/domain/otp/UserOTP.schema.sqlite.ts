import { relations, sql } from "drizzle-orm";
import { text, sqliteTable, integer, index } from "drizzle-orm/sqlite-core";

import { timestamps } from "../../helper/schemas/timestamp.column.helper";
import { userTable } from "../user/User.schema.sqlite";

export const userOtpTable = sqliteTable('user_otp', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    userId: text('user_id', { mode: 'text' }).notNull().references(() => userTable.id),
    otpCode: text('otp_code', { mode: 'text' }).notNull(), // 6 digit code
    type: text('type', { mode: 'text' }).notNull(), // "email_verification", "password_reset", "phone_number_verification"
    expiresAt: integer('expires_at', { mode: "timestamp" }).notNull(),
    isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(sql`0`),
    ...timestamps
}, table => {
    return {
        userIdOTPCodeExpiresAtIdx: index("user_otp_user_id_otp_code_expires_at_idx").on(table.userId, table.otpCode, table.expiresAt),
    };
})

export const userOtpRelation = relations(userOtpTable, ({ one }) => ({
    user: one(userTable, { fields: [userOtpTable.userId], references: [userTable.id] }),
}))
