"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, KeyRound, Loader2, Lock, Sparkles } from "lucide-react";
import { isAdmin, login } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    isAdmin().then((authed) => {
      if (authed) {
        router.replace("/admin");
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password) {
      toast("Enter the admin password.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await login(password);
      toast("Welcome back!", "success");
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Login failed.", "error");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/4 top-16 h-64 w-64 rounded-full bg-slate-200/40 blur-3xl"
      />

      <div className="relative w-full max-w-md animate-fade-up">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2.5 text-slate-700 transition-colors hover:text-slate-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-slate-500 text-white">
            <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-semibold text-slate-900">Yamone Cosmetics</span>
        </Link>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-7 shadow-xl backdrop-blur sm:p-9">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-brand-600">
              <Lock className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-semibold text-slate-900">Admin login</h1>
            <p className="mt-1.5 text-sm text-slate-700">
              Enter your password to manage the Yamone catalogue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-slate-900">
                Admin password
              </label>
              <div className="relative">
                <KeyRound
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />
                <input
                  id="admin-password"
                  type={visible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  autoFocus
                  className="input-field pr-12 pl-11"
                  disabled={submitting || checking}
                />
                <button
                  type="button"
                  onClick={() => setVisible((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-50"
                  aria-label={visible ? "Hide password" : "Show password"}
                >
                  {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={submitting || checking}>
              {submitting || checking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  {checking ? "Checking session…" : "Signing in…"}
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" aria-hidden="true" /> Sign in
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Password is set via the <code className="rounded bg-slate-50 px-1.5 py-0.5">ADMIN_PASSWORD</code>{" "}
            environment variable.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-700">
          <Link href="/" className="font-medium text-brand-600 transition-colors hover:text-slate-600">
            ← Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}
