"use client";

import { Loader2, TriangleAlert } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      onClick={() => !busy && onCancel()}
    >
      <div
        className="w-full max-w-sm border border-slate-200 bg-white p-6 text-center shadow-xl animate-scale-in"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center bg-rose-600 text-white">
          <TriangleAlert className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-display text-lg font-extrabold uppercase tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{description}</p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-2 bg-rose-600 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="btn-ghost sm:w-32"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
