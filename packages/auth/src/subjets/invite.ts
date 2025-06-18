import { z } from "zod";

export const inviteSubject = z.tuple([
	z.union([
		z.literal("manage"),
		z.literal("create"),
		z.literal("get"),
		z.literal("delete"),
	]),
	z.literal("Invite"),
]);

export type ProjectSubject = z.infer<typeof inviteSubject>;
