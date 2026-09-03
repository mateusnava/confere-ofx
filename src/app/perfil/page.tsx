import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getUserByEmail } from "@/lib/quota";
import { PLAN_PRICES } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Perfil | Confere OFX",
};

const PLAN_LABEL = {
  free: "Gratis",
  pro: PLAN_PRICES.pro.label,
  escritorio: PLAN_PRICES.escritorio.label,
} as const;

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await getUserByEmail(session.user.email);

  return (
    <main className="flex-1 bg-[#f4fbf9] px-6 py-16">
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F6B5C]">
          Conta
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Perfil
        </h1>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-[#6b8a84]">Email</p>
          <p className="mt-1 font-medium text-slate-900">{session.user.email}</p>
          <p className="mt-5 text-sm text-[#6b8a84]">Plano</p>
          <p className="mt-1 font-medium text-[#0F6B5C]">
            {PLAN_LABEL[user?.plan ?? "free"]}
          </p>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/pdf-para-ofx"
            className="rounded-full bg-[#0F6B5C] px-5 py-2 text-sm font-semibold text-white"
          >
            Converter extrato
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="rounded-full border border-[#0F6B5C]/20 px-5 py-2 text-sm font-semibold text-[#0F6B5C]"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
