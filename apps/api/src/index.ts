import { defineAbilityFor } from "@repo/auth";

const ability = defineAbilityFor({ role: "ADMIN" });

const userCanInviteSomeoneElse = ability.can("invite", "User");

console.log(userCanInviteSomeoneElse);
