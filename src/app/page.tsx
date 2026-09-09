import type { Metadata } from "next";
import { CarimboLanding } from "@/components/CarimboLanding";

export const metadata: Metadata = {
  title: "Converter PDF em OFX | Confere OFX",
  description:
    "Converta PDF para OFX. Foto do caderno também. A gente lê, soma e só libera se o saldo fechar.",
};

export default function HomePage() {
  return <CarimboLanding />;
}
