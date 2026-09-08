import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { auth, signOut } from "@/auth";
import { PixCheckoutRefresh } from "@/components/PixCheckout";
import {
  CREDIT_PACKS,
  formatCredits,
  parsePackKind,
  reconcilePendingPayments,
} from "@/lib/credits";
import { getDb } from "@/lib/db/client";
import { payments } from "@/lib/db/schema";
import { getUserByEmail } from "@/lib/quota";

export const metadata: Metadata = {
  title: "Perfil | Confere OFX",
};

function paymentStatusLabel(status: string) {
  if (status === "paid") return "pago";
  if (status === "pending") return "pendente";
  if (status === "failed") return "falhou";
  return status;
}

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const existing = await getUserByEmail(session.user.email);
  if (existing) {
    await reconcilePendingPayments(getDb(), existing.id);
  }

  const user = await getUserByEmail(session.user.email);
  const history = user
    ? await getDb()
        .select({
          id: payments.id,
          kind: payments.kind,
          status: payments.status,
          amountCents: payments.amountCents,
          createdAt: payments.createdAt,
        })
        .from(payments)
        .where(eq(payments.userId, user.id))
        .orderBy(desc(payments.createdAt))
        .limit(8)
    : [];

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
          <p className="text-sm text-[#6b8a84]">E-mail</p>
          <p className="mt-1 font-medium text-slate-900">{session.user.email}</p>
          <p className="mt-5 text-sm text-[#6b8a84]">Creditos</p>
          <p className="mt-1 font-medium text-[#0F6B5C]">
            {formatCredits(user?.credits ?? 0)}
          </p>
          {user?.freeConversionUsed ? (
            <p className="mt-3 text-sm text-[#3d5c56]">Conversao gratis ja usada</p>
          ) : null}
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Comprar creditos</h2>
          <div className="mt-4">
            <PixCheckoutRefresh />
          </div>
        </section>

        {history.length > 0 ? (
          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Pagamentos</h2>
            <ul className="mt-4 space-y-2 text-sm text-[#3d5c56]">
              {history.map((payment) => {
                const kind = parsePackKind(payment.kind);
                const price = kind ? CREDIT_PACKS[kind].price : null;
                return (
                  <li key={payment.id}>
                    {paymentStatusLabel(payment.status)}
                    {price ? ` · ${price}` : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <p className="mt-6 text-sm text-[#3d5c56]">
          Se a pagina expirar, envie o PDF outra vez.
        </p>

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
