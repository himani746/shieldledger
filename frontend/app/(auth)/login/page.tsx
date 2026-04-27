"use client";

import { motion } from "framer-motion";
import { Lock, Mail, Shield, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) return setError("Please enter a valid email.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1500));
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.ok) router.push("/dashboard");
    else setError("Invalid credentials. Please try again.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md rounded-2xl p-6"
      >
        <div className="mb-6 text-center">
          <Shield className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-2 text-2xl font-bold text-text">Welcome back</h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field icon={<Mail className="h-4 w-4" />} type="email" placeholder="Email" value={email} onChange={setEmail} />
          <div className="relative">
            <Field
              icon={<Lock className="h-4 w-4" />}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={setPassword}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-3 text-muted"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && (
            <motion.p
              initial={{ x: -5 }}
              animate={{ x: [0, -5, 5, -5, 0] }}
              className="text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
          <button className="w-full rounded-xl bg-gradient-to-r from-primary to-indigo-500 px-4 py-3 font-semibold transition hover-glow-purple active:scale-[0.98]" disabled={loading}>
            {loading ? <span className="mx-auto inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Sign in"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-secondary hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function Field({
  icon,
  type,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-3 text-muted">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-surface2/80 py-2.5 pl-10 pr-10 text-text outline-none transition focus:border-primary"
      />
    </div>
  );
}
