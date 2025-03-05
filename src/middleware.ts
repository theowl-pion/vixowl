import { clerkMiddleware } from "@clerk/nextjs/server";

// Use the simple clerkMiddleware with redirection handled in the ClerkProvider
export default clerkMiddleware();

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
