"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { FilterControls, type FilterControlsProps } from "./FilterControls";

type FilterSheetProps = FilterControlsProps & {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
};

export function FilterSheet({
  open,
  onClose,
  onReset,
  ...controls
}: FilterSheetProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[75] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Product filters"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl animate-slide-up">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200" aria-hidden="true" />

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <FilterControls {...controls} />

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onReset} className="btn-ghost flex-1">
            Reset
          </button>
          <button type="button" onClick={onClose} className="btn-primary flex-1">
            Show results
          </button>
        </div>
      </div>
    </div>
  );
}
