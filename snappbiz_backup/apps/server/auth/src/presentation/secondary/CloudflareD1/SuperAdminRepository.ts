
import { DrizzleD1Database } from "drizzle-orm/d1";

import type { ICreateSuperAdmin, ISuperAdmin } from "@snappbiz/auth";
import { superAdmin } from "@snappbiz/auth";
import { generateId } from "@snappbiz/crypto";

import { eq } from "drizzle-orm";

import type { ISuperAdminRepository } from "../../../application/ports/ISuperAdminRepository";

export class SuperAdminRepository implements ISuperAdminRepository {
    constructor(private readonly _db: DrizzleD1Database) { }

    async findUserByUsername(username: string): Promise<ISuperAdmin | null> {
        try {
            const superAdminTable = superAdmin.superAdminTable;
            const user = await this._db.select({
                id: superAdminTable.id,
                username: superAdminTable.username,
                passwordHash: superAdminTable.passwordHash,
                isActive: superAdminTable.isActive
            })
                .from(superAdminTable)
                .where(eq(superAdminTable.username, username))
                .limit(1);

            if (!user[0]) {
                return null;
            }

            return user[0];
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async insertUser(input: ICreateSuperAdmin): Promise<ISuperAdmin> {
        const superAdminTable = superAdmin.superAdminTable;

        const userId = generateId(10);

        // Cast to IRegisterSuperUser because the type is not fully compatible with the schema
        const SuperAdminRegisterEntity = {
            id: userId,
            username: input.username,
            email: input.email,
            passwordHash: input.passwordHash,
            isActive: true
        };

        const result = await this._db.insert(superAdminTable).values(SuperAdminRegisterEntity).returning({
            sub: superAdminTable.id,
            username: superAdminTable.username,
            isActive: superAdminTable.isActive
        });

        return result[0];
    }
}
