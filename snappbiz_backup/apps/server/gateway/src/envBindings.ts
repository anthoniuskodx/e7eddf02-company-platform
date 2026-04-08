import { z } from 'zod';

const EnvSchema = z.object({
    NODE_ENV: z.string(),
    BACKEND_URL: z.string().url(),
    AUTH_WORKER: z.object({
        loginWithPassword: z.function(),
        registerSuperAdmin: z.function(),
        loginSuperAdmin: z.function()
    }).passthrough(),
    SUPERADMIN_KEY: z.string()
}).superRefine((input, ctx) => {
    if (input.NODE_ENV === "production" && !input.NODE_ENV) {
        ctx.addIssue({
            code: z.ZodIssueCode.invalid_type,
            expected: "string",
            received: "undefined",
            path: ["NODE_ENV"],
            message: "Must be set when NODE_ENV is 'production'",
        });
    }
});
  
export type EnvBindings = z.infer<typeof EnvSchema>;

export const parseEnv = (data: any): EnvBindings => {
    const { data: env, error } = EnvSchema.safeParse(data);
  
    if (error) {
      const errorMessage = `❌ Invalid env - ${Object.entries(error.flatten().fieldErrors).map(([key, errors]) => `${key}: ${errors.join(",")}`).join(" | ")}`;
      throw new Error(errorMessage);
    }
  
    return env;
}
