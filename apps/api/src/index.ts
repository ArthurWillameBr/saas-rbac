import { ability } from "@repo/auth"

const userCanInviteSomeoneElse = ability.can("invite", "User")

console.log(userCanInviteSomeoneElse)