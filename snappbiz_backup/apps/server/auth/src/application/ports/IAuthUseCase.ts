export interface IPasswordLoginUseCase<TInput, TOutput> {
    executeWithPassword(input: TInput): Promise<TOutput>;
}
