import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyEmailCode } from "@/lib/auth/email-code";
import type { PlanId } from "@/lib/plans";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      id: "email-code",
      name: "Email code",
      credentials: {
        email: { type: "email" },
        code: { type: "text" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const code = String(credentials?.code ?? "").trim();

        if (!email || !code) {
          return null;
        }

        return verifyEmailCode(email, code);
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.plan = user.plan;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.email = token.email ?? "";
      session.user.plan = (token.plan as PlanId | undefined) ?? "free";
      return session;
    },
  },
});
