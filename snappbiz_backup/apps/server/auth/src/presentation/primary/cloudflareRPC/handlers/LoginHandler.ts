import { RpcTarget } from "cloudflare:workers";

import type { ISuperadminLoginDto } from "@snappbiz/auth";
import type { ISuperAdminLoginResultDto } from "@snappbiz/auth";

import { generateToken } from "@snappbiz/jwt";

import type { ILoginSuperAdminUseCase } from "../../../../application/ports/ILoginSAUseCase";
import { EnvBindings } from "apps/server/auth/src/envBindings";
import { access } from "fs";

export class LoginHandler extends RpcTarget {
  constructor(
    private readonly _loginSuperAdminUseCase: ILoginSuperAdminUseCase<ISuperadminLoginDto, ISuperAdminLoginResultDto>,
  ) {
    super();

    this._loginSuperAdminUseCase = _loginSuperAdminUseCase;
  }

  async loginSuperAdmin(payload: ISuperadminLoginDto, bindings: EnvBindings) {
    const { JWT_PRIVATE_KEY, JWT_ISSUER } = bindings;

    if (!JWT_PRIVATE_KEY || !JWT_ISSUER) {
      throw new Error('JWT_PRIVATE_KEY or JWT_ISSUER is not defined');
    }

    try {
      const result = await this._loginSuperAdminUseCase.loginSuperAdmin(payload);

      // Generate authorized token
      // TODO: Add randomize code
      const token = await generateToken(JWT_PRIVATE_KEY, JWT_ISSUER, result.sub, payload.clientId);

      const returnResult = {
        accessToken: token.getAccessToken(),
        idToken: token.getIdToken(),
        user: result
      }

      return returnResult;
    } catch (error) {
      console.error(error);
      return { error: (error as Error).message };
    }
  }
}
