import type { z } from "zod";

import { insertSuperAdminSchema, selectSuperAdminSchema } from "./SuperAdmin.validator";

export type ISuperAdmin = z.infer<typeof selectSuperAdminSchema>;

export type ICreateSuperAdmin = z.infer<typeof insertSuperAdminSchema>;
