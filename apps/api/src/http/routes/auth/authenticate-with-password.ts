import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

const authenticateWithPasswordSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

export async function authenticateWithPassword(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        "/sessions/password", 
        {
        schema: {
            tags: ["Auth"],
            summary: "Authenticate with password",
            body: authenticateWithPasswordSchema,
        }
    }, async (request, reply) => {
        const { email, password } = request.body

        const userFromEmail = await prisma.user.findUnique({
            where: {
                email,
            }
        })

        if (!userFromEmail) {
            return reply.status(400).send({ message: "User with same e-mail does not exist." });
        }
    
        // Nunca logou usando senha
        if(userFromEmail.passwordHash === null) {
            return reply.status(400).send({ message: "user does not have a password, use social login." });
        }

        const isPasswordValid = await compare(password, userFromEmail.passwordHash)

        if(!isPasswordValid) {
            return reply.status(400).send({ message: "Invalid password." });
        }

        const token = await reply.jwtSign({
            sub: userFromEmail.id,
        }, {
            sign: {
                expiresIn: "7d",
            }
        })

        return reply.status(201).send({
            token,
        })
    })
}