"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { Building2, Lock, Mail, Shield, User } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (org.trim().length < 2) return setError("Organisation name is required.");
    if (!email.includes("@")) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);

    const autoSignIn = async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    };

    try {
      await new Promise((r) => setTimeout(r, 1500));
      await axios.post(`/api/auth/register`, {
        org_name: org,
        email,
        password,
      });
      await autoSignIn();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card w-full max-w-md rounded-2xl p-6">
        <div className="mb-6 text-center">
          <Shield className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-2 text-2xl font-bold text-text">Create your account</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field icon={<Building2 className="h-4 w-4" />} placeholder="Organisation name" value={org} onChange={setOrg} type="text" />
          <Field icon={<Mail className="h-4 w-4" />} placeholder="Email address" value={email} onChange={setEmail} type="email" />
          <Field icon={<Lock className="h-4 w-4" />} placeholder="Password" value={password} onChange={setPassword} type="password" />
          <div className="h-2 overflow-hidden rounded-full bg-surface2">
            <div className={`h-full transition-all ${strength === 1 ? "w-1/3 bg-red-400" : strength === 2 ? "w-2/3 bg-amber-400" : strength >= 3 ? "w-full bg-secondary" : "w-0"}`} />
          </div>
          <Field icon={<User className="h-4 w-4" />} placeholder="Confirm password" value={confirm} onChange={setConfirm} type="password" />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button className="w-full rounded-xl bg-gradient-to-r from-primary to-indigo-500 py-3 font-semibold transition hover-glow-purple active:scale-[0.98]" disabled={loading}>
            {loading ? <span className="mx-auto inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Create account"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function Field({
  icon,
  placeholder,
  value,
  onChange,
  type,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-3 text-muted">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-surface2/80 py-2.5 pl-10 text-text outline-none transition focus:border-primary"
      />
    </div>
  );
}
