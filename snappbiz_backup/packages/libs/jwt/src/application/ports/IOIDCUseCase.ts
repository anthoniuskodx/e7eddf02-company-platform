export interface IOIDCUseCase {
    generateAuthorizationKey(userId: string, clientId: string): Promise<string>;
}
