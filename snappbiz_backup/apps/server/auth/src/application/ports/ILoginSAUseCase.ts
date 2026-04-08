export interface ILoginSuperAdminUseCase<TInput, TOutput> {
    loginSuperAdmin(input: TInput): Promise<TOutput>;
}
