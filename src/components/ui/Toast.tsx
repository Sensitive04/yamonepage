"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const variantStyles: Record<
  ToastVariant,
  { className: string; iconClassName: string; Icon: typeof Info }
> = {
  success: {
    className: "border-stone-200 bg-white text-stone-900",
    iconClassName: "text-emerald-500",
    Icon: CheckCircle2,
  },
  error: {
    className: "border-stone-200 bg-white text-stone-900",
    iconClassName: "text-rose-500",
    Icon: XCircle,
  },
  info: {
    className: "border-stone-200 bg-white text-stone-900",
    iconClassName: "text-brand-500",
    Icon: Info,
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "success", action?: ToastAction) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-3), { id, message, variant, action }]);
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:items-end"
        role="status"
        aria-live="polite"
      >
        {toasts.map((item) => {
          const { className, iconClassName, Icon } = variantStyles[item.variant];
          const action = item.action;
          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-md backdrop-blur animate-scale-in ${className}`}
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClassName}`} aria-hidden="true" />
              <p className="flex-1 text-sm font-medium text-stone-900">{item.message}</p>
              {action && (
                <button
                  type="button"
                  onClick={() => {
                    action.onClick();
                    dismiss(item.id);
                  }}
                  className="shrink-0 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
                >
                  {action.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="-m-1 rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
