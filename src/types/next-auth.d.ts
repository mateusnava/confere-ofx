import type { DefaultSession } from "next-auth";
import type { PlanId } from "@/lib/plans";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    plan: PlanId;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      plan: PlanId;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    plan?: PlanId;
  }
}
