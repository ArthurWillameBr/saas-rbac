import { defineAbilityFor, organizationSchema, userSchema } from "@repo/auth";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { auth } from "@/http/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { BadRequestError } from "../_errors/bad-request-error";
import { UnauthorizedError } from "../_errors/unauthorized-error";

export async function transferOrganization(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.patch(
			"/organizations/:slug/owner",
			{
				schema: {
					tags: ["Organizations"],
					summary: "Transfer organization ownership",
					security: [{ bearerAuth: [] }],
					params: z.object({
						slug: z.string(),
					}),
					body: z.object({
						transferToUserId: z.string().uuid(),
					}),
					response: {
						204: z.null(),
					},
				},
			},
			async (request, reply) => {
				const { slug } = request.params;

				const userId = await request.getCurrentUserId();

				const { membership, organization } =
					await request.getUserMembership(slug);

				const authUser = userSchema.parse({
					id: userId,
					role: membership.role,
				});

				const authOrganization = organizationSchema.parse({
					id: organization.id,
					ownerId: organization.ownerId,
				});

				const { cannot } = defineAbilityFor(authUser);

				if (cannot("transfer_ownership", authOrganization)) {
					throw new UnauthorizedError(
						"You are not allowed to transfer ownership of this organization.",
					);
				}
				const { transferToUserId } = request.body;

				const transferToMemberShip = await prisma.member.findUnique({
					where: {
						organizationId_userId: {
							organizationId: organization.id,
							userId: transferToUserId,
						},
					},
				});

				if (!transferToMemberShip) {
					throw new BadRequestError(
						"User is not a member of this organization.",
					);
				}

				await prisma.$transaction([
					prisma.member.update({
						where: {
							organizationId_userId: {
								organizationId: organization.id,
								userId: transferToUserId,
							},
						},
						data: {
							role: "ADMIN",
						},
					}),
					prisma.organization.update({
						where: {
							id: organization.id,
						},
						data: {
							ownerId: transferToUserId,
						},
					}),
				]);

				return reply.status(204).send();
			},
		);
}
