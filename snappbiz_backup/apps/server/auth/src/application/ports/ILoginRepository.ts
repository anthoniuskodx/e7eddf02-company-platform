import type { ISuperadminLoginDto } from "@snappbiz/auth";
import type { ISuperAdminLoginResultDto } from "@snappbiz/auth";

export interface ILoginRepository {
    loginSuperAdmin(input: ISuperadminLoginDto): Promise<ISuperAdminLoginResultDto>;
}
