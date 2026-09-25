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
  "/api/auth/reset-password",
];

function isPublicRequest(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === "/") return true;
  return publicPaths.some((path) => path !== "/" && (pathname === path || pathname.startsWith(`${path}/`)));
}

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/fonts/") ||
    pathname.startsWith("/video/") ||
    pathname.startsWith("/assets/") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/chrono_icon.png" ||
    pathname === "/chrono-wordmark.svg" ||
    pathname === "/name.svg" ||
    pathname === "/favicon.svg" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|mp4|webm)$/i.test(pathname)
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|fonts|video|assets|[^?]*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)).*)",
  ],
};
