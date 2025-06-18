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
	MEMBER(_, { can }) {
		can("invite", "User");
	},
	BILLING(_, { can }) {
		can("manage", "all");
	},
};
