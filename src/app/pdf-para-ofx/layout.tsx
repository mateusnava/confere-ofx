import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF para OFX | Confere OFX",
  description:
    "Converta extrato bancario brasileiro em OFX, Excel ou CSV. A gente confere o saldo.",
};

export default function PdfParaOfxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
