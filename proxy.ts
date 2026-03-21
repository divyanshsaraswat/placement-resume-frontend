import { auth } from "@/app/auth";
import { 
  PUBLIC_ROUTES, 
  AUTH_ROUTES, 
  ROLE_PATHS, 
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

    // 2. Role-based namespace protection: check if they are in the correct namespace
    const role = ((req.auth?.user as any)?.role as string | undefined)?.toLowerCase();
    const path = nextUrl.pathname.toLowerCase();

    // Skip check for shared dashboard pages
    const sharedPaths = ['/dashboard/settings', '/dashboard'];
    if (sharedPaths.some(p => path === p)) return;

    // Enforce that roles stay within their dashboard namespaces
    if (role) {
      const roleEntries = Object.entries(ROLE_PATHS);
      for (const [r, basePath] of roleEntries) {
        if (path.startsWith(basePath) && role !== r) {
          // Exception: Admin can access any role namespace
          if (role === 'admin') continue;
          
          // Redirect unauthorized access to their own role's home
          return Response.redirect(new URL(getRolePath(role), nextUrl));
        }
      }
    }
  }

  return;
});

export const proxy = authMiddleware;
export default authMiddleware;

// Optionally, don't run middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:webp|png|jpg|jpeg|gif|svg|ico|css|js|woff2?|ttf|eot)$).*)'],
};
