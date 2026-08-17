export const ADMIN_ROLES = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
  EDITOR: "EDITOR",
};

export const ROLE_PERMISSIONS = {
  SUPERADMIN: ["*"],
  ADMIN: ["content", "news", "articles", "categories", "faq", "products", "users", "bonuses"],
  EDITOR: ["news", "articles", "categories", "faq", "media"],
};

export const hasPermission = (role, permission) => {
  if (!role) return false;
  const grants = ROLE_PERMISSIONS[role];
  if (!grants) return false;
  if (grants.includes("*")) return true;
  if (!permission) return true;
  return grants.includes(permission);
};
