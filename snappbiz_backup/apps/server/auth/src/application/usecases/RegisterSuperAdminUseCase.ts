import type { ISuperadminRegisterDto } from '@snappbiz/auth';
import type { ISuperAdminRegisterResultDto } from '@snappbiz/auth';
import { Scrypt } from '@snappbiz/crypto';

import type { IRegisterSuperAdminUseCase } from '../ports/IRegisterSAUseCase';
import type { ISuperAdminRepository } from '../ports/ISuperAdminRepository';

export class RegisterSuperAdminUseCase implements IRegisterSuperAdminUseCase<ISuperadminRegisterDto, ISuperAdminRegisterResultDto> {
    constructor(private readonly _superAdminRepository: ISuperAdminRepository) { }

    async registerSuperAdmin(input: ISuperadminRegisterDto): Promise<ISuperAdminRegisterResultDto> {
        try {
            const user = await this._superAdminRepository.findUserByUsername(input.username);

            if (user && user !== null) {
                throw new Error("User already exists");
            }

            const scrypt = new Scrypt();
            const passwordHash = await scrypt.hash(input.password);
            const result = await this._superAdminRepository.insertUser({
                ...input,
                passwordHash
            });

            const resultData = {
                sub: result.id,
                username: result.username,
                isActive: Boolean(result.isActive)
            };

            return resultData;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
