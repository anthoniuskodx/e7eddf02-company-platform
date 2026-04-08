export class JWT {
    constructor(private readonly _accessToken: string, private readonly _idToken: string) {}

    getAccessToken(): string {
        return this._accessToken;
    }
    getIdToken(): string {
        return this._idToken;
    }
}
