import { z } from "zod";

export const organizationSubject = z.tuple([
	z.union([
		z.literal("manage"),
		z.literal("create"),
		z.literal("delete"),
		z.literal("update"),
		z.literal("transfer_ownership"),
	]),
	z.literal("Organization"),
]);

export type ProjectSubject = z.infer<typeof organizationSubject>;
