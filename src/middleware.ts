import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicPaths = [
  "/",
  "/product",
  "/method",
  "/security",
  "/resources",
  "/ascii-generator",
  "/login",
  "/signup",
  "/reset-password",
  "/auth/callback",
  "/invite",
  "/api/workspace/invites",
];

function isPublicRequest(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === "/") return true;
  return publicPaths.some((path) => path !== "/" && (pathname === path || pathname.startsWith(`${path}/`)));
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const authHeader = request.headers.get("authorization");
  const isApi = pathname.startsWith("/api/");

  if (isApi && authHeader?.startsWith("Bearer ")) {
    return response;
  }

  if (!user && isApi && !isPublicRequest(request)) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (!user && !isPublicRequest(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const next = request.nextUrl.searchParams.get("next");
    const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : "/projects";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|fonts|video).*)"],
};