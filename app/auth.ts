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
    async jwt({ token, account, user }) {
      if (account && user) {
        try {
          // Exchange Google ID Token for our backend JWT
          const response = await fetch(`${process.env.API_ENDPOINT || "http://localhost:8000"}/api/v1/auth/login/google?token=${account.id_token}`, {
            method: "POST",
          });

          if (response.ok) {
            const data = await response.json();
            return {
              ...token,
              backendToken: data.access_token,
              accessToken: account.access_token,
              idToken: account.id_token,
            }
          }
        } catch (error) {
          console.error("Backend token exchange failed:", error);
        }
        
        return {
          ...token,
          accessToken: account.access_token,
          idToken: account.id_token,
        }
      }
      return token
    },
    async session({ session, token }: any) {
      session.accessToken = token.backendToken || token.accessToken
      session.idToken = token.idToken
      return session
    },
  },
  secret: process.env.AUTH_SECRET,
})
