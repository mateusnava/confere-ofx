"use client";

import { useCallback, useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import {
  BLOB_ACCESS,
  blobPathnameFor,
  mimeTypeForUpload,
} from "@/lib/storage/upload";

type DropzoneProps = {
  onUploaded: (payload: { blobUrl: string; mimeType: string }) => void;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
};

type UploadProvider = "local" | "vercel";

export function Dropzone({ onUploaded, disabled, onBusyChange }: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<UploadProvider>("local");

  useEffect(() => {
    void fetch("/api/blob")
      .then((response) => response.json())
      .then((data: { provider?: UploadProvider }) => {
        if (data.provider === "vercel" || data.provider === "local") {
          setProvider(data.provider);
        }
      })
      .catch(() => {
        setProvider("local");
      });
  }, []);

  const uploadLocal = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/blob", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "Falha no envio do arquivo");
    }

    onUploaded({
      blobUrl: data.url,
      mimeType: mimeTypeForUpload(file.name, file.type),
    });
  }, [onUploaded]);

  const uploadVercel = useCallback(async (file: File) => {
    const contentType = mimeTypeForUpload(file.name, file.type);
    if (!contentType) {
      throw new Error("Tipo de arquivo invalido");
    }

    const blob = await upload(blobPathnameFor(file.name), file, {
      access: BLOB_ACCESS,
      contentType,
      handleUploadUrl: "/api/blob",
      abortSignal: AbortSignal.timeout(30_000),
    });

    onUploaded({
      blobUrl: blob.url,
      mimeType: contentType,
    });
  }, [onUploaded]);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;

      setUploading(true);
      onBusyChange?.(true);
      setError(null);

      try {
        if (provider === "vercel") {
          await uploadVercel(file);
        } else {
          await uploadLocal(file);
        }
      } catch (uploadError) {
        const timedOut =
          uploadError instanceof DOMException &&
          uploadError.name === "TimeoutError";
        setError(
          timedOut
            ? "O envio demorou demais. Tente de novo."
            : uploadError instanceof Error
              ? uploadError.message
              : "Falha no envio",
        );
      } finally {
        setUploading(false);
        onBusyChange?.(false);
      }
    },
    [onBusyChange, provider, uploadLocal, uploadVercel],
  );

  return (
    <div
      className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${
        dragging ? "border-teal-700 bg-teal-50" : "border-teal-200 bg-white"
      } ${disabled ? "opacity-60" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) {
          void handleFiles(event.dataTransfer.files);
        }
      }}
    >
      <p className="text-lg font-medium text-slate-800">
        Arraste seu PDF ou foto do extrato
      </p>
      <p className="mt-2 text-sm text-slate-500">
        PDF, JPEG ou PNG. Maximo 20 MB e 50 paginas.
      </p>
      {provider === "local" ? (
        <p className="mt-2 text-xs text-slate-400">
          Modo local: o arquivo fica neste computador.
        </p>
      ) : null}
      <label className="mt-6 inline-flex cursor-pointer rounded-full bg-[#0F6B5C] px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800">
        {uploading ? "Enviando..." : "Selecionar arquivo"}
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          className="hidden"
          disabled={disabled || uploading}
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </label>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
