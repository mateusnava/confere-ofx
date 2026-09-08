"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PixCheckout } from "@/components/PixCheckout";

export function CreditWall({ onPaid }: { onPaid?: () => void }) {
  const router = useRouter();
  const [paid, setPaid] = useState(false);

  if (paid) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <h3 className="text-lg font-semibold text-amber-950">
        Voce ja usou a conversao gratis. Compre creditos para continuar.
      </h3>
      <p className="mt-2 text-sm text-amber-900">
        Depois de pagar, envie o PDF de novo.
      </p>
      <div className="mt-4">
        <PixCheckout
          onPaid={() => {
            setPaid(true);
            onPaid?.();
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
