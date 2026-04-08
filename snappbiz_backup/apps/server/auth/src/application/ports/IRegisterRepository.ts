import type { ISuperadminRegisterDto } from "@snappbiz/auth";
import type { ISuperAdminRegisterResultDto } from "@snappbiz/auth";

export interface IRegisterRepository {
    registerSuperAdmin(input: ISuperadminRegisterDto): Promise<ISuperAdminRegisterResultDto>;
}
