import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { userTable } from './User.schema.sqlite';
// import { userTable } from './User.schema.sqlite';

// // Schema for inserting a user - can be used to validate API requests
// export const insertUserSchema = createInsertSchema(userTable, {
//     id: (schema) => schema.id.positive()
// });

// // Zod schema type is also inferred from the table schema, so you have full type safety
// export const requestSchema = z.object({
//   id: z.number().openapi({
//     example: 12,
//   })
// });

// Schema for selecting a user - can be used to validate API responses
export const selectUserSchema = createSelectSchema(userTable, {
  createdAt: (schema) => schema.createdAt.optional(),
  updatedAt: (schema) => schema.updatedAt.optional(),
});

