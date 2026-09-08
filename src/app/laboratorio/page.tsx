import Link from "next/link";
import { LAB_VERSIONS } from "@/lib/lab-versions";

export default function LaboratorioIndexPage() {
  return (
    <main className="min-h-full bg-[#f4fbf9] px-6 py-16 pb-28 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0F6B5C]">
          Laboratorio
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Quatro versoes da pagina inicial
        </h1>
        <p className="mt-4 max-w-xl text-lg text-[#3d5c56]">
          A página inicial atual continua em{" "}
          <Link href="/" className="font-semibold text-[#0F6B5C] underline">
            /
          </Link>
          . Xerox/vidraça e a mais trabalhada. Mesa, Xerox e Carimbo abrem na
          foto manuscrita.
        </p>
        <ol className="mt-12 space-y-4">
          {LAB_VERSIONS.map((version, index) => (
            <li key={version.slug}>
              <Link
                href={`/laboratorio/${version.slug}`}
                className="flex items-baseline gap-4 rounded-2xl px-5 py-4 transition-colors hover:brightness-95"
                style={{ background: version.paper, color: version.ink }}
              >
                <span className="text-sm font-semibold opacity-70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block text-xl font-semibold">
                    {version.title}
                  </span>
                  <span className="mt-1 block text-sm opacity-80">
                    {version.blurb}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
