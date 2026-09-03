import Link from "next/link";
import { auth } from "@/auth";

export async function Header() {
  const session = await auth();
  const email = session?.user?.email;

  return (
    <header className="border-b border-[#0F6B5C]/10 bg-[#f4fbf9]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F6B5C]"
        >
          Confere OFX
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/pdf-para-ofx" className="text-[#3d5c56] hover:text-[#0F6B5C]">
            Converter
          </Link>
          {email ? (
            <Link
              href="/perfil"
              className="rounded-full bg-[#0F6B5C] px-4 py-1.5 font-semibold text-white hover:bg-teal-800"
            >
              Perfil
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#0F6B5C] px-4 py-1.5 font-semibold text-white hover:bg-teal-800"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
