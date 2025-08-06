import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifySwagger from "@fastify/swagger";
import scalarFastifyApiReference from "@scalar/fastify-api-reference";
import fastify from "fastify";
import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import { errorHandler } from "./error-handler";
import { authenticateWithGithub } from "./routes/auth/authenticate-with-github";
import { authenticateWithPassword } from "./routes/auth/authenticate-with-password";
import { createAccount } from "./routes/auth/create-account";
import { getProfile } from "./routes/auth/get-profile";
import { requestPasswordRecover } from "./routes/auth/request-password-recover";
import { resetPassword } from "./routes/auth/reset-password";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setErrorHandler(errorHandler);

app.register(fastifySwagger, {
	openapi: {
		info: {
			title: "SampleApi",
			description: "Sample backend service",
			version: "1.0.0",
		},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
	},
	transform: jsonSchemaTransform,
});

app.register(scalarFastifyApiReference, {
	routePrefix: "/documentation",
	configuration: {
		theme: "kepler",
	},
});

app.register(fastifyJwt, {
	secret: "my-secret",
});

app.register(fastifyCors);
app.register(createAccount);
app.register(authenticateWithPassword);
app.register(getProfile);
app.register(requestPasswordRecover);
app.register(resetPassword);
app.register(authenticateWithGithub);

app.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
	console.log("HTTP server running!");
});
