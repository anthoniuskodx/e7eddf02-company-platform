import type { ICreateSuperAdmin, ISuperAdmin } from "@snappbiz/auth";

export interface ISuperAdminRepository {
    findUserByUsername(username: string): Promise<ISuperAdmin | null>;
    insertUser(input: ICreateSuperAdmin): Promise<ISuperAdmin>;
}
