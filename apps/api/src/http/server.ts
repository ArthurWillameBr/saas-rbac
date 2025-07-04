import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastifyJwt from "@fastify/jwt";
import fastify from "fastify";
import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import { createAccount } from "./routes/auth/create-account";
import { authenticateWithPassword } from "./routes/auth/authenticate-with-password";
import { getProfile } from "./routes/auth/get-profile";
import { errorHandler } from "./error-handler";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
	openapi: {
		info: {
			title: "SampleApi",
			description: "Sample backend service",
			version: "1.0.0",
		},
		servers: [],
	},
	transform: jsonSchemaTransform,

	// You can also create transform with custom skiplist of endpoints that should not be included in the specification:
	//
	// transform: createJsonSchemaTransform({
	//   skipList: [ '/documentation/static/*' ]
	// })
});

app.register(fastifySwaggerUI, {
	routePrefix: "/documentation",
});

app.register(fastifyJwt, {
	secret: "my-secret",
});

app.register(fastifyCors);
app.register(createAccount);
app.register(authenticateWithPassword);
app.register(getProfile);

app.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
	console.log("HTTP server running!");
});
