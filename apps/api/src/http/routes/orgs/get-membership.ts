import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { auth } from "@/http/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { createOrgSlug } from "@/utls/create-org-slug";
import { BadRequestError } from "../_errors/bad-request-error";

const createOrganizationBody = z.object({
	name: z.string(),
	domain: z.string().nullish(),
	shouldAttachUsersByDomain: z.boolean().optional(),
});

export async function getMembership(app: FastifyInstance) {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(auth)
		.post(
			"/organizations/:slug/membership",
			{
				schema: {
					tags: ["Organizations"],
					summary: "Get organization membership",
					security: [
						{
							bearerAuth: [],
						},
					],
					params: z.object({
						slug: z.string(),
					}),
				},
			},
			async (request, _) => {
				const { slug } = request.params;

				const { membership } = await request.getUserMembership(slug);

				return {
					membership: {
						id: membership.id,
						role: membership.role,
						organizationId: membership.organizationId,
					},
				};
			},
		);
}
