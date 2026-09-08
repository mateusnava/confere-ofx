import type { Metadata } from "next";
import { Archivo, Big_Shoulders, Bricolage_Grotesque, Caveat } from "next/font/google";
import { Suspense } from "react";
import { LabSwitcher } from "@/components/LabSwitcher";
import "./lab-landings.css";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-hand",
});

const mesa = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-mesa",
});

const carne = Archivo({
  subsets: ["latin"],
  variable: "--font-carne",
});

const scanner = Big_Shoulders({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-scanner",
});

export const metadata: Metadata = {
  title: "Laboratorio | Confere OFX",
  robots: { index: false, follow: false },
};

export default function LaboratorioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${caveat.variable} ${mesa.variable} ${carne.variable} ${scanner.variable}`}>
      {children}
      <Suspense>
        <LabSwitcher />
      </Suspense>
    </div>
  );
}
