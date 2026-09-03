import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ConvertClient } from "./ConvertClient";

export default async function PdfParaOfxPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login?next=/pdf-para-ofx");
  }
  return <ConvertClient />;
}
