import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { UnauthorizedError } from "../_errors/unauthorized-error";
import { BadRequestError } from "../_errors/bad-request-error";

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
            response: {
                201: z.object({
                    token: z.string(),
                }),
            }
        }
    }, async (request, reply) => {
        const { email, password } = request.body

        const userFromEmail = await prisma.user.findUnique({
            where: {
                email,
            }
        })

        if (!userFromEmail) {
            throw new UnauthorizedError("Invalid credentials");
        }
    
        // Nunca logou usando senha
        if(userFromEmail.passwordHash === null) {
            throw new BadRequestError("user does not have a password, use social login.");
        }

        const isPasswordValid = await compare(password, userFromEmail.passwordHash)

        if(!isPasswordValid) {
            throw new UnauthorizedError("Invalid credentials");
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