import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export async function createAccount(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post("users", {
        schema: {
            body: z.object({
                message: z.string(),
            })
        }
    },() => {
        return {
            message: "Hello World"
        }
    } )
}