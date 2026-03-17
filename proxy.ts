import { auth } from "@/app/auth";
import { 
  PUBLIC_ROUTES, 
  AUTH_ROUTES, 
  getRolePath 
} from "@/lib/routes";

const authMiddleware = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);
  const isAuthRoute = AUTH_ROUTES.includes(nextUrl.pathname);
  const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard");

  // 1. If it's an auth route (login)
  if (isAuthRoute) {
    if (isLoggedIn) {
      // Redirect to their respective dashboard if already logged in
      const role = (req.auth?.user as any)?.role;
      return Response.redirect(new URL(getRolePath(role), nextUrl));
    }
    return;
  }

  // 2. If it's a protected route
  if (isProtectedRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login", nextUrl));
    }

    // Role-based protection: check if they are in the correct namespace
    const role = (req.auth?.user as any)?.role?.toLowerCase();
    const path = nextUrl.pathname.toLowerCase();

    if (role === 'student' && path.startsWith('/dashboard/admin')) {
        return Response.redirect(new URL(getRolePath(role), nextUrl));
    }
    if (role === 'student' && path.startsWith('/dashboard/faculty')) {
        return Response.redirect(new URL(getRolePath(role), nextUrl));
    }
    // Add more role-specific constraints as needed
  }

  return;
});

export const proxy = authMiddleware;
export default authMiddleware;

// Optionally, don't run middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
