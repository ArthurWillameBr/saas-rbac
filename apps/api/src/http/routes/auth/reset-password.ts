import { hash } from "bcryptjs";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { auth } from "@/http/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function resetPassword(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.post(
			"/password/reset",
			{
				schema: {
					tags: ["Auth"],
					summary: "Reset password",
					body: z.object({
						code: z.string(),
						password: z.string().min(6),
					}),
					response: {
						204: z.object({
							message: z.string(),
						}),
					},
				},
			},
			async (request, reply) => {
				const { code, password } = request.body;

				const tokenFromCode = await prisma.token.findUnique({
					where: {
						id: code,
					},
				});

				if (!tokenFromCode) {
					throw new UnauthorizedError("Invalid code.");
				}

				const passwordHash = await hash(password, 6);

				await prisma.user.update({
					where: {
						id: tokenFromCode.userId,
					},
					data: {
						passwordHash,
					},
				});

				return reply
					.status(204)
					.send({ message: "Password reset successfully." });
			},
		);
}
