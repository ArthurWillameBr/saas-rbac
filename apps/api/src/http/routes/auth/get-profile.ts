import { prisma } from "@/lib/prisma";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { NotFoundError } from "../_errors/not-found-error";
import { auth } from "@/http/middlewares/auth";

export async function getProfile(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().register(auth).get(
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
            }
        }
    }, async (request, reply) => {
       const userId = await request.getCurrentUserId()

       const user = await prisma.user.findUnique({
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
        },
        where: {
            id: userId,
        }
       })

       if(!user) {
        throw new NotFoundError("User not found.");
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