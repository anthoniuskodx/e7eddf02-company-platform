import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { superAdminTable } from './SuperAdmin.schema.sqlite';

// Schema for inserting a super user - can be used to validate API requests
export const insertSuperAdminSchema = createInsertSchema(superAdminTable, {
    username: (schema) => schema.username
        .min(3, { message: "Username must be at least 3 characters long" })
        .max(31, { message: "Username must be no more than 31 characters long" })
        .regex(/^[a-z0-9_-]+$/, { message: "Username can only contain lowercase letters, numbers, underscores, or hyphens" }),
    email: (schema) => schema.email.email({ message: "Invalid email address" }),
    passwordHash: (schema) => schema.passwordHash,
    createdAt: (schema) => schema.createdAt.optional(),
    updatedAt: (schema) => schema.updatedAt.optional(),
});

// Schema for selecting a user - can be used to validate API responses
export const selectSuperAdminSchema = createSelectSchema(superAdminTable, {
    isActive: (schema) => schema.isActive,  // Remove .boolean()
    createdAt: (schema) => schema.createdAt.optional(),
    updatedAt: (schema) => schema.updatedAt.optional(),
});
