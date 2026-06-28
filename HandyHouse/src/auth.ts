import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Ensure redirect works correctly in development and production
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === new URL(baseUrl).origin) return url;
      return baseUrl;
    },
  },
});
