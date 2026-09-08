import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { safeNextPath } from "@/lib/safe-next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Entrar | Confere OFX",
  description: "Entre ou crie sua conta com um codigo enviado no e-mail.",
};

async function requestOrigin() {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const session = await auth();
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const origin = await requestOrigin();

  if (session?.user?.email) {
    redirect(safeNextPath(next, origin));
  }

  return (
    <main className="flex flex-1 justify-center bg-[#f4fbf9] px-6 py-16">
      <div className="w-full max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F6B5C]">
          Acesso
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Entre ou crie sua conta
        </h1>
        <p className="mt-3 text-[#3d5c56]">
          Sem senha. Enviamos um codigo de 6 digitos no seu e-mail. O primeiro
          acesso ja cria a conta.
        </p>
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <LoginForm next={next} origin={origin} />
        </div>
      </div>
    </main>
  );
}
