"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message ?? "Login failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden border-r border-foreground/10 bg-foreground/[0.03] p-10 lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="inline-flex rounded-full border border-foreground/15 px-3 py-1 text-xs uppercase tracking-wide text-foreground/70">
            Task Manager
          </p>
          <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight">Organize your work with clarity.</h1>
          <p className="mt-4 max-w-md text-base text-foreground/70">
            Secure task tracking with protected routes, encrypted payload handling, and a focused workflow.
          </p>
        </div>
        <p className="text-sm text-foreground/60">Built with Next.js + PostgreSQL + JWT security.</p>
      </section>

      <section className="mx-auto flex w-full max-w-xl items-center px-6 py-10">
        <div className="w-full rounded-2xl border border-foreground/15 bg-background p-8">
          <h2 className="text-2xl font-semibold">Welcome back</h2>
          <p className="mt-2 text-sm text-foreground/70">Sign in to continue to your dashboard.</p>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Email address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-foreground/20 bg-background px-4 py-3 outline-none ring-0 focus:border-foreground"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-foreground/20 bg-background px-4 py-3 outline-none ring-0 focus:border-foreground"
              />
            </label>

            {error ? (
              <p className="rounded-xl border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-foreground px-4 py-3 font-medium text-background disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-foreground/80">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium underline underline-offset-4">
              Create one
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
