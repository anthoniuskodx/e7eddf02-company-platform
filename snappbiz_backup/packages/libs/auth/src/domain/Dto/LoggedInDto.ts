// Response
export interface ILoginResult {
    success: boolean;
    token?: string;
    sessionId?: string;
    error?: string;
}

export class LoginResult implements ILoginResult {
    success: boolean;
    token?: string;
    sessionId?: string;
    error?: string;

    constructor(success: boolean, token?: string, sessionId?: string, error?: string) {
        this.success = success;
        this.token = token;
        this.sessionId = sessionId;
        this.error = error;
    }
}