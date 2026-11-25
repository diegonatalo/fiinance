import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type CurrentUser = { id: string; name: string; email: string };

/** A pessoa logada nesta requisição, ou null. Só o necessário sai daqui. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result) return null;
  const { id, name, email } = result.user;
  return { id, name, email };
}
