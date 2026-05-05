"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Login failed");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate2-50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate2-200 bg-white p-8 shadow-lg shadow-slate2-200/50">
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 p-3 text-white shadow-lg shadow-brand-500/30">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">ServiceHub Admin</p>
            <h1 className="font-display text-3xl font-black text-slate2-900">Admin Login</h1>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="rounded-xl border border-slate2-200 bg-slate2-50 px-4 py-3">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate2-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@servicehub.com"
              className="w-full bg-transparent text-sm text-slate2-900 outline-none focus:border-brand-500"
              required
            />
          </div>

          <div className="rounded-xl border border-slate2-200 bg-slate2-50 px-4 py-3">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate2-500">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full bg-transparent text-sm text-slate2-900 outline-none focus:border-brand-500"
              required
            />
          </div>

          {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3 text-sm font-bold text-white transition hover:from-brand-700 hover:to-brand-800 disabled:cursor-not-allowed disabled:opacity-70 shadow-lg shadow-brand-500/30"
          >
            <LockKeyhole className="h-4 w-4" />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <Link href="/" className="text-slate2-600 hover:text-slate2-900">
            Back To Home
          </Link>
          <Link href="/admin/signup" className="font-semibold text-brand-600 hover:text-brand-700">
            Create First Admin
          </Link>
        </div>
      </div>
    </main>
  );
}

