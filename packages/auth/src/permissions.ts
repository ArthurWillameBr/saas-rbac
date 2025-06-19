import type { AbilityBuilder } from "@casl/ability";
import type { AppAbility } from ".";
import type { User } from "./models/user";
import type { Role } from "./roles";

type PermissionsByRole = (
	user: User,
	builder: AbilityBuilder<AppAbility>,
) => void;

type Roles = Role

export const permissions: Record<Roles, PermissionsByRole> = {
	ADMIN(_, { can }) {
		can("manage", "Billing");
	},
	MEMBER(user, { can }) {
		can(["create", "get"], "Project");
		can(["update", "delete"], "Project", {ownerId: { $eq: user.id }});
	},
	BILLING(_, {  }) {
	},
};
