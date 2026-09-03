"use client";

import { CREDIT_PACKS, type PackKind } from "@/lib/credits";

const ORDER = ["pack_1", "pack_10", "pack_50"] as const;

export function CreditPacks({
  selected,
  onSelect,
}: {
  selected: PackKind;
  onSelect: (kind: PackKind) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {ORDER.map((kind) => {
        const pack = CREDIT_PACKS[kind];
        const active = selected === kind;
        return (
          <button
            key={kind}
            type="button"
            onClick={() => onSelect(kind)}
            className={`rounded-xl border p-4 text-left ${
              active
                ? "border-[#0F6B5C] bg-white ring-2 ring-[#0F6B5C]/20"
                : "border-[#0F6B5C]/15 bg-white"
            }`}
          >
            <p className="font-semibold text-slate-900">{pack.label}</p>
            <p className="text-sm text-slate-600">{pack.price}</p>
          </button>
        );
      })}
    </div>
  );
}
