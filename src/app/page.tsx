import type { Metadata } from "next";
import { CarimboLanding } from "@/components/CarimboLanding";

export const metadata: Metadata = {
  title: "Converter PDF em OFX | Confere OFX",
  description:
    "Converta PDF para OFX. Foto do caderno tambem. A gente le, soma e so libera se o saldo fechar.",
};

export default function HomePage() {
  return <CarimboLanding />;
}
