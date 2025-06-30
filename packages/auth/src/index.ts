import {
	AbilityBuilder,
	type CreateAbility,
	type MongoAbility,
	createMongoAbility,
} from "@casl/ability";
import { z } from "zod";
import type { User } from "./models/user";
import { permissions } from "./permissions";
import { billingSubject } from "./subjects/billing";
import { inviteSubject } from "./subjects/invite";
import { organizationSubject } from "./subjects/organization";
import { projectSubject } from "./subjects/project";
import { userSubject } from "./subjects/user";

const AppAbilitiesSchema = z.union([
	userSubject,
	projectSubject,
	organizationSubject,
	inviteSubject,
	billingSubject,
	z.tuple([z.literal("manage"), z.literal("all")]),
]);

export type AppAbility = MongoAbility<z.infer<typeof AppAbilitiesSchema>>;

export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

export function defineAbilityFor(user: User) {
	const builder = new AbilityBuilder(createAppAbility);

	if (typeof permissions[user.role] !== "function") {
		throw new Error(`Permissions for role ${user.role} not found`);
	}

	permissions[user.role](user, builder);

	const ability = builder.build({
		detectSubjectType(subject) {
			return subject.__typename;
		},
	});

	return ability;
}
