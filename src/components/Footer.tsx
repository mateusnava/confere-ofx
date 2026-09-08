import Link from "next/link";
import { auth } from "@/auth";
import { ContactDialog } from "@/components/ContactDialog";

const links = [
  { href: "/privacidade", label: "Política de privacidade" },
  { href: "/termos", label: "Termos de uso" },
  { href: "/quem-somos", label: "Quem somos" },
] as const;

type FooterProps = {
  variant?: "app" | "landing" | "artigos";
};

export async function Footer({ variant = "app" }: FooterProps) {
  const session = await auth();
  const userEmail = session?.user?.email ?? null;

  const nav = (
    <nav aria-label="Institucional" className="site-footer-nav">
      {links.map((link) => (
        <Link key={link.href} href={link.href}>
          {link.label}
        </Link>
      ))}
      <ContactDialog userEmail={userEmail} />
    </nav>
  );

  if (variant === "landing") {
    return <footer className="site-footer site-footer--landing">{nav}</footer>;
  }

  if (variant === "artigos") {
    return (
      <footer className="artigos-foot">
        <div className="artigos-foot-inner">{nav}</div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto border-t border-[#0F6B5C]/10 bg-[#f4fbf9]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0F6B5C]">
          Confere OFX
        </p>
        <div className="flex flex-wrap gap-5 text-sm text-[#3d5c56] [&_a]:hover:text-[#0F6B5C] [&_button]:hover:text-[#0F6B5C]">
          {nav}
        </div>
      </div>
    </footer>
  );
}
