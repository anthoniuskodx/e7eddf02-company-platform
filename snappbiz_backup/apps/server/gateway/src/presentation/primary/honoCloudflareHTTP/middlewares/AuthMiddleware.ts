import type { Context, Next } from 'hono';

export const authMiddleware = () => {
    return async (c: Context, next: Next) => {
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const token = authHeader.split(' ')[1];

        try {
            // const payload = await authRepository.verifyToken(token);
            // c.set('user', payload);
            await next();
        } catch (error) {
            return c.json({ error: 'Invalid token' }, 401);
        }
    };
};
