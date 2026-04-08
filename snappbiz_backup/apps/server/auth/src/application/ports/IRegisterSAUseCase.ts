export interface IRegisterSuperAdminUseCase<TInput, TOutput> {
    registerSuperAdmin(input: TInput): Promise<TOutput>;
}
