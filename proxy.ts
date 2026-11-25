import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { signInPath } from "@/lib/paths";

/**
 * Checagem otimista: sem o cookie de sessão, o app manda direto para o login,
 * sem renderizar nada. A sessão de verdade é conferida no layout do app e em
 * cada Server Action.
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();
  const { pathname, search } = request.nextUrl;
  return NextResponse.redirect(new URL(signInPath(pathname + search), request.url));
}

export const config = {
  matcher: ["/app", "/app/:path*"],
};
