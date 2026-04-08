export interface ISuperAdminAPIAuthResult {
    success: boolean;
    data?: {
        token: string;
        refreshToken: string;
        user: {
            id: string;
            username: string;
            isActive: boolean;
        }
    };
    error?: string;
}
