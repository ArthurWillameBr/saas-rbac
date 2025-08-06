import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		JWT_SECRET: z.string(),
		DATABASE_URL: z.string().url(),
		GITHUB_CLIENT_ID: z.string(),
		GITHUB_CLIENT_SECRET: z.string(),
		GITHUB_CLIENT_REDIRECT_URI: z.string(),
	},
	client: {},
	shared: {},
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		JWT_SECRET: process.env.JWT_SECRET,
		GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
		GITHUB_CLIENT_REDIRECT_URI: process.env.GITHUB_CLIENT_REDIRECT_URI,
		GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
	},
	emptyStringAsUndefined: true,
});
