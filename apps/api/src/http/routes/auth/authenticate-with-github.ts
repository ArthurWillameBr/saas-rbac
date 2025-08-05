import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { BadRequestError } from "../_errors/bad-request-error";

const authenticateWithGithubSchema = z.object({
	code: z.string(),
});

export async function authenticateWithGithub(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		"/sessions/github",
		{
			schema: {
				tags: ["Auth"],
				summary: "Authenticate with Github",
				body: authenticateWithGithubSchema,
				response: {
					201: z.object({
						token: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { code } = request.body;

			const githubOauthUrl = new URL(
				"https://github.com/login/oauth/access_token",
			);

			githubOauthUrl.searchParams.set("client_id", "Ov23ligNkEz9Z3NvYCx9");
			githubOauthUrl.searchParams.set(
				"client_secret",
				process.env.GITHUB_CLIENT_SECRET!,
			);
			githubOauthUrl.searchParams.set(
				"redirect_uri",
				"http://localhost:3000/api/auth/callback",
			);
			githubOauthUrl.searchParams.set("code", code);

			const githubAccessTokenResponse = await fetch(githubOauthUrl, {
				method: "POST",
				headers: {
					Accept: "application/json",
				},
			});

			const githubAccessTokenData = await githubAccessTokenResponse.json();

			const { access_token: githubAccessToken } = z
				.object({
					access_token: z.string(),
					token_type: z.string(),
					scope: z.string(),
				})
				.parse(githubAccessTokenData);

			const githubUserResponse = await fetch("https://api.github.com/user", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${githubAccessToken}`,
				},
			});

			const githubUserData = await githubUserResponse.json();

			const {
				id: githubId,
				avatar_url: avatarUrl,
				name,
				email,
			} = z
				.object({
					id: z.number().int().transform(String),
					avatar_url: z.string().url(),
					name: z.string().nullable(),
					email: z.string().nullable(),
				})
				.parse(githubUserData);

			if (email === null) {
				throw new BadRequestError(
					"You Github account must have an email to authenticate",
				);
			}

			let user = await prisma.user.findUnique({
				where: { email },
			});

			if (!user) {
				user = await prisma.user.create({
					data: {
						name,
						email,
						avatarUrl,
					},
				});
			}

			let account = await prisma.account.findUnique({
				where: {
					provider_userId: {
						provider: "GITHUB",
						userId: user.id,
					},
				},
			});

			if (!account) {
				account = await prisma.account.create({
					data: {
						provider: "GITHUB",
						providerAccountId: githubId,
						userId: user.id,
					},
				});
			}

			const token = await reply.jwtSign(
				{
					sub: user.id,
				},
				{
					sign: {
						expiresIn: "7d",
					},
				},
			);

			return reply.status(201).send({
				token,
			});
		},
	);
}
