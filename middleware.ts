import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// Define public paths that don't require authentication
const publicPaths = [
  "/",
  "/pricing",
  "/gallery",
  "/api/stripe/test",
  "/api/webhook",
  "/sign-in*",
  "/sign-up*",
  "/auth/callback",
];

const isPublic = (path: string) => {
  return publicPaths.find((x) =>
    path.match(new RegExp(`^${x.replace("*", ".*")}$`))
  );
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If the path is public, don't apply authentication
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Create a Supabase client for auth
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If the user is not authenticated and the path is not public, redirect to sign-in
  if (!session) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
