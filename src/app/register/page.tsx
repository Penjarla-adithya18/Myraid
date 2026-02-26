"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message ?? "Registration failed");
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
          <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight">Create your secure workspace.</h1>
          <p className="mt-4 max-w-md text-base text-foreground/70">
            Register once and manage all tasks through authenticated APIs with encrypted data handling.
          </p>
        </div>
        <p className="text-sm text-foreground/60">Your credentials are hashed and sessions are cookie-based.</p>
      </section>

      <section className="mx-auto flex w-full max-w-xl items-center px-6 py-10">
        <div className="w-full rounded-2xl border border-foreground/15 bg-background p-8">
          <h2 className="text-2xl font-semibold">Create account</h2>
          <p className="mt-2 text-sm text-foreground/70">Start managing your tasks in minutes.</p>

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

            <p className="rounded-xl border border-foreground/15 bg-foreground/[0.03] px-3 py-2 text-xs text-foreground/75">
              Password must include at least 8 characters, one uppercase letter, one lowercase letter, and one number.
            </p>

            {error ? (
              <p className="rounded-xl border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-foreground px-4 py-3 font-medium text-background disabled:opacity-70"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-foreground/80">
            Already have an account?{" "}
            <Link href="/login" className="font-medium underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
