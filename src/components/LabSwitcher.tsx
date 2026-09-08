"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LAB_VERSIONS } from "@/lib/lab-versions";

export function LabSwitcher() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4">
      <nav
        aria-label="Versoes do laboratorio"
        className="pointer-events-auto flex max-w-full flex-wrap items-center gap-1 rounded-full border border-black/10 bg-[oklch(0.98_0.01_160)]/95 p-1 shadow-lg backdrop-blur"
      >
        <Link
          href="/laboratorio"
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            pathname === "/laboratorio"
              ? "bg-[#0F6B5C] text-white"
              : "text-[#0F6B5C] hover:bg-[#0F6B5C]/10"
          }`}
        >
          Indice
        </Link>
        {LAB_VERSIONS.map((version) => {
          const href = `/laboratorio/${version.slug}`;
          const active = pathname === href;
          return (
            <Link
              key={version.slug}
              href={href}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                active
                  ? "bg-[#0F6B5C] text-white"
                  : "text-[#0F6B5C] hover:bg-[#0F6B5C]/10"
              }`}
            >
              {version.title}
            </Link>
          );
        })}
        <Link
          href="/"
          className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#3d5c56] hover:bg-[#0F6B5C]/10"
        >
          Página inicial
        </Link>
      </nav>
    </div>
  );
}
