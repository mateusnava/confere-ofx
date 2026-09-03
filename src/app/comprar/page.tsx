import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PixCheckoutRefresh } from "@/components/PixCheckout";
import { formatCredits } from "@/lib/credits";
import { getUserByEmail } from "@/lib/quota";

export default async function ComprarPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login?next=/comprar");
  }
  const user = await getUserByEmail(session.user.email);

  return (
    <main className="flex-1 px-6 py-16">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight">Comprar creditos</h1>
        <p className="mt-2 text-[#3d5c56]">
          Voce tem {formatCredits(user?.credits ?? 0)}. Creditos nao vencem.
        </p>
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <PixCheckoutRefresh />
        </div>
      </div>
    </main>
  );
}
