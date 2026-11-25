import { createAuthClient } from "better-auth/client";

/** Cliente do Better Auth no navegador; fala com `/api/auth` do próprio site. */
export const authClient = createAuthClient();
