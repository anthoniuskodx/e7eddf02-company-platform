import { OpenAPIHono } from "@hono/zod-openapi";

import { parseEnv } from "../../../../envBindings";
import superAdminRoutes from "./SuperAdmin/SuperAdminRoute";

// Create OpenAPIHono instance
const mainRoutes = new OpenAPIHono();

mainRoutes.use((c, next) => {
    c.env = parseEnv(Object.assign(c.env || {}, process.env));
    return next();
})
mainRoutes.get('/heartbeat', (c) => c.text("true"))

mainRoutes.route('/super-admin', superAdminRoutes)

mainRoutes.use('/protected-route/*', async (c, next) => {
    const test = await fetch("https://google.com")
    return next();
    // const auth = getAuth(c)
    // console.log(auth)
    // const req: any = c.req.raw

    // // // const sessionId = 'sess_2nd6fTO1saWznkZouTkYDclbXuW'

    // // // const template = 'BackendServer'


    // // // console.log(response)
    // console.log(actrs)

    // if (!auth?.userId) {
    //     return c.json({
    //         message: 'You are not logged in.'
    //     }, 401)
    // } else {
    //     return next();
    // }
})
mainRoutes.get('/protected-route/test', (c) => c.json({ message: 'Hello World' }))

export default mainRoutes;
