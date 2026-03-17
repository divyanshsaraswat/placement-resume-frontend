import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && account.id_token) {
        try {
          const response = await fetch(`${process.env.API_ENDPOINT || "http://localhost:8000"}/api/v1/auth/login/google?token=${account.id_token}`, {
            method: "POST",
          });

          if (!response.ok) {
            const errorData = await response.json();
            // This error message is passed to the login page
            throw new Error(errorData.detail || "Only @mnit.ac.in emails are allowed");
          }

          const data = await response.json();
          // Attach token to user object for jwt callback
          (user as any).backendToken = data.access_token;
          return true;
        } catch (error: any) {
          console.error("Backend token exchange failed:", error);
          // Redirect to login with error parameter
          return `/login?error=${encodeURIComponent(error.message || "AccessDenied")}`;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user && (user as any).backendToken) {
        token.backendToken = (user as any).backendToken;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.accessToken = token.backendToken || token.accessToken;
      session.idToken = token.idToken;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.AUTH_SECRET,
})
