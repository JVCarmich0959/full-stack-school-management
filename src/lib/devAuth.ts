export type DevRole = "admin" | "teacher" | "student" | "parent" | "guest";

const VALID_ROLES: DevRole[] = ["admin", "teacher", "student", "parent", "guest"];

export const DEV_USER_ID = "dev-user";

export function getSessionRole(): DevRole {
  const normalizedRole = process.env.DEV_ROLE?.toLowerCase();

  if (normalizedRole && VALID_ROLES.includes(normalizedRole as DevRole)) {
    return normalizedRole as DevRole;
  }

  return "admin";
}
