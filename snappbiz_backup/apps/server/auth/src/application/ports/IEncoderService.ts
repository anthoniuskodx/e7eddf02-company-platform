export interface IEncoderService {
    encodeToken(): string;
    encodeSessionId(token: string): string;
}
