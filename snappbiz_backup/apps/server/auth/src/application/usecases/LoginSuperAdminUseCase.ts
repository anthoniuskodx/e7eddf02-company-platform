import type { ISuperadminLoginDto } from '@snappbiz/auth';
import type { ISuperAdminLoginResultDto } from '@snappbiz/auth';

import { Scrypt } from '@snappbiz/crypto';

import type { ILoginSuperAdminUseCase } from '../ports/ILoginSAUseCase';
import { ISuperAdminRepository } from '../ports/ISuperAdminRepository';

export class LoginSuperAdminUseCase implements ILoginSuperAdminUseCase<ISuperadminLoginDto, ISuperAdminLoginResultDto> {
    constructor(private readonly _superAdminRepository: ISuperAdminRepository) { }

    async loginSuperAdmin(input: ISuperadminLoginDto): Promise<ISuperAdminLoginResultDto> {
        try {
            const result = await this._superAdminRepository.findUserByUsername(input.username);

            if (!result || result === null) {
                throw new Error("User not found");
            }
            const scrypt = new Scrypt();
            const isPasswordValid = await scrypt.verify(result.passwordHash, input.password);

            if (!isPasswordValid) {
                throw new Error("Invalid password");
            }

            const resultData: ISuperAdminLoginResultDto = {
                sub: result.id,
                username: result.username,
                isActive: Boolean(result.isActive)
            }

            return resultData;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
