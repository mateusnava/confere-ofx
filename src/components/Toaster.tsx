"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/lib/use-is-client";

type ToastMessage = {
  id: number;
  title: string;
  description?: string;
};

type ToastListener = () => void;

let nextId = 1;
let toasts: ToastMessage[] = [];
const listeners = new Set<ToastListener>();
const EMPTY_TOASTS: ToastMessage[] = [];

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(onStoreChange: ToastListener) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function showToast(title: string, description?: string) {
  const id = nextId++;
  toasts = [...toasts, { id, title, description }];
  emit();
  window.setTimeout(() => {
    toasts = toasts.filter((toast) => toast.id !== id);
    emit();
  }, 5000);
}

export function Toaster() {
  const isClient = useIsClient();
  const items = useSyncExternalStore(subscribe, () => toasts, () => EMPTY_TOASTS);

  if (!isClient || items.length === 0) {
    return null;
  }

  return createPortal(
    <div
      className="pointer-events-none flex justify-center px-4"
      style={{ position: "fixed", top: 80, right: 0, left: 0, zIndex: 80 }}
    >
      <ul className="flex w-full max-w-sm flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.id}
            role="status"
            className="toast-in flex gap-3 rounded-xl border border-[#0F6B5C]/15 bg-white px-4 py-3 shadow-md"
          >
            <span
              aria-hidden
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0F6B5C] text-white"
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.25a1 1 0 0 1-1.428.01l-3.3-3.25a1 1 0 1 1 1.396-1.428l2.58 2.542 6.494-6.544a1 1 0 0 1 1.452.006Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              {item.description ? (
                <p className="mt-0.5 text-sm text-[#3d5c56]">{item.description}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>,
    document.body,
  );
}
