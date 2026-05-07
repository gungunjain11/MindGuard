"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginWithEmail } from "@/src/lib/firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await loginWithEmail(form.email, form.password);
      localStorage.setItem("uid", user.uid);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="authPage">
      <form className="authCard" onSubmit={handleSubmit}>
        <h1>Login</h1>
        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
        <input 
          placeholder="Email" 
          type="email" 
          onChange={(e) => setForm({ ...form, email: e.target.value })} 
        />
        <input 
          placeholder="Password" 
          type="password" 
          onChange={(e) => setForm({ ...form, password: e.target.value })} 
        />
        <button className="primaryBtn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <p style={{ textAlign: "center", color: "var(--muted)" }}>
          Don't have an account? <Link href="/signup" style={{ color: "var(--primary)" }}>Sign up</Link>
        </p>
      </form>
    </main>
  );
}
