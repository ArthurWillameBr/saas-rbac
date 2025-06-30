import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export async function getProfile(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        "/profile", 
        {
        schema: {
            tags: ["Auth"],
            summary: "Get authenticated user profile",
            response: {
                200: z.object({
                    user: z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.string().email(),
                        avatarUrl: z.string().url().nullable(),
                    }),
                }),
                400: z.object({
                    message: z.string(),
                }),
            }
        }
    }, async (request, reply) => {
       const { sub } = await request.jwtVerify<{ sub: string }>()

       const user = await prisma.user.findUnique({
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
        },
        where: {
            id: sub,
        }
       })

       if(!user) {
        return reply.status(400).send({ message: "User not found." })
       }

       return reply.status(200).send({
        user: {
            id: user.id,
            name: user.name ?? "",
            email: user.email,
            avatarUrl: user.avatarUrl ?? null,
        },
       })
    })
}