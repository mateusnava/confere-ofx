"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditPacks } from "@/components/CreditPacks";
import { showToast } from "@/components/Toaster";
import { CREDIT_PACKS, formatCredits, type PackKind } from "@/lib/credits";

export function PixCheckoutRefresh() {
  const router = useRouter();
  return <PixCheckout onPaid={() => router.refresh()} />;
}

export function PixCheckout({ onPaid }: { onPaid?: (credits: number) => void }) {
  const [kind, setKind] = useState<PackKind>("pack_1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pix, setPix] = useState<{
    paymentId: string;
    qrCode: string;
    qrCodeBase64: string;
  } | null>(null);
  const [status, setStatus] = useState<"pending" | "paid" | "failed" | null>(
    null,
  );
  const toastedPaid = useRef(false);

  async function refreshStatus(paymentId: string) {
    const response = await fetch(`/api/pay/pix?paymentId=${paymentId}`);
    const data = (await response.json()) as {
      status?: "pending" | "paid" | "failed";
      credits?: number;
      error?: string;
    };
    if (!response.ok) {
      throw new Error(data.error ?? "Erro ao consultar Pix");
    }
    setStatus(data.status ?? "pending");
    if (data.status === "paid") {
      const credits = data.credits ?? 0;
      if (!toastedPaid.current) {
        toastedPaid.current = true;
        showToast("Pagamento confirmado", `Voce tem ${formatCredits(credits)}.`);
      }
      onPaid?.(credits);
      setPix(null);
    }
  }

  useEffect(() => {
    if (!pix || status === "paid") {
      return;
    }
    const timer = window.setInterval(() => {
      void refreshStatus(pix.paymentId).catch(() => undefined);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [pix, status]);

  async function buy() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/pay/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Erro ao gerar Pix");
      }
      setPix(data);
      setStatus("pending");
      toastedPaid.current = false;
    } catch (buyError) {
      setError(buyError instanceof Error ? buyError.message : "Erro ao gerar Pix");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <CreditPacks selected={kind} onSelect={setKind} />
      <button
        type="button"
        onClick={() => void buy()}
        disabled={loading}
        className="rounded-full bg-[#0F6B5C] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Gerando Pix..." : `Pagar ${CREDIT_PACKS[kind].price} no Pix`}
      </button>
      {pix ? (
        <div className="rounded-xl border border-[#0F6B5C]/15 bg-white p-4">
          {pix.qrCodeBase64 ? (
            <img
              alt="QR Code Pix"
              src={`data:image/png;base64,${pix.qrCodeBase64}`}
              className="mx-auto h-48 w-48"
            />
          ) : null}
          <p className="mt-3 break-all text-xs text-slate-600">{pix.qrCode}</p>
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-[#0F6B5C]"
            onClick={() => void refreshStatus(pix.paymentId)}
          >
            Ja paguei
          </button>
        </div>
      ) : null}
      {status === "failed" ? (
        <p className="text-sm text-red-600">Pix expirou. Gere outro.</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
