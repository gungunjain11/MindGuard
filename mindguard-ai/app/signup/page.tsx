"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signupWithEmail } from "@/src/lib/firebase/auth";
import { saveUserProfile } from "@/src/lib/firebase/firestore";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await signupWithEmail(form.name, form.email, form.password);
      await saveUserProfile(user.uid, { name: form.name, email: form.email });
      localStorage.setItem("uid", user.uid);
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="authPage">
      <form className="authCard" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
        <input 
          placeholder="Full name" 
          onChange={(e) => setForm({ ...form, name: e.target.value })} 
        />
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
          {loading ? "Creating account..." : "Sign up"}
        </button>
        <p style={{ textAlign: "center", color: "var(--muted)" }}>
          Already have an account? <Link href="/login" style={{ color: "var(--primary)" }}>Login</Link>
        </p>
      </form>
    </main>
  );
}
