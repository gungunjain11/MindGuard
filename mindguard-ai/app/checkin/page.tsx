"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import Navbar from "@/src/components/shared/Navbar";
import { createCheckin } from "@/src/lib/firebase/firestore";
import { calculateBurnoutScore } from "@/src/lib/scoring/burnoutScore";
import {
  MoodIcon,
  StressIcon,
  SleepIcon,
  StudyIcon,
  SocialIcon,
  CheckIcon
} from "@/src/components/icons";

export default function CheckinPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [form, setForm] = useState({
    mood: 3,
    stress: 3,
    sleepHours: 7,
    studyHours: 5,
    socialRating: 3
  });

  const [score, setScore] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Recalculate score in real-time as form changes
  useEffect(() => {
    const newScore = calculateBurnoutScore(form);
    setScore(newScore);
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const uid = user?.uid;
      if (!uid) throw new Error("User not authenticated");

      // Save check-in to Firestore with calculated score
      await createCheckin(uid, {
        ...form,
        structuredRiskScore: score.score,
        structuredRiskLevel: score.level,
        contributors: score.contributors
      });

      setSubmitted(true);
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to save check-in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <>
        <Navbar />
        <main className="pageWrap">
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p>Loading...</p>
          </div>
        </main>
      </>
    );
  }

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="pageWrap">
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div className="card" style={{ maxWidth: "400px", margin: "0 auto", padding: "40px" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  background: "var(--success)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white"
                }}>
                  <CheckIcon size={24} />
                </div>
              </div>
              <h2 style={{ marginBottom: "8px" }}>Check-in Saved</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "0" }}>
                Your daily check-in has been recorded. Redirecting to dashboard...
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pageWrap">
      <form className="card formGrid" onSubmit={handleSubmit} style={{ maxWidth: "640px", margin: "0 auto" }}>
        <div>
          <h1 style={{ marginBottom: "4px" }}>Daily Check-in</h1>
          <p style={{ color: "var(--text-secondary)", margin: "0", fontSize: "0.95rem" }}>
            Log your current wellness. Takes less than a minute.
          </p>
        </div>

        {error && (
          <div style={{ 
            padding: "12px 14px", 
            background: "rgba(196, 93, 93, 0.12)", 
            borderRadius: "var(--radius-sm)", 
            color: "#e89898",
            fontSize: "0.9rem"
          }}>
            {error}
          </div>
        )}

        {/* Input Group */}
        <div style={{ display: "grid", gap: "18px" }}>
          {/* Mood */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <MoodIcon size={18} color="var(--tertiary)" />
              <span style={{ fontSize: "0.95rem", fontWeight: "500" }}>
                Mood: <strong>{form.mood}</strong>/5
              </span>
            </label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={form.mood} 
              onChange={(e) => setForm({ ...form, mood: Number(e.target.value) })}
            />
            <p style={{ margin: "6px 0 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              How are you feeling emotionally?
            </p>
          </div>

          {/* Stress */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <StressIcon size={18} color="var(--danger)" />
              <span style={{ fontSize: "0.95rem", fontWeight: "500" }}>
                Stress: <strong>{form.stress}</strong>/5
              </span>
            </label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={form.stress} 
              onChange={(e) => setForm({ ...form, stress: Number(e.target.value) })}
            />
            <p style={{ margin: "6px 0 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              How stressed are you right now?
            </p>
          </div>

          {/* Sleep */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <SleepIcon size={18} color="var(--secondary)" />
              <span style={{ fontSize: "0.95rem", fontWeight: "500" }}>
                Sleep: <strong>{form.sleepHours}</strong>h
              </span>
            </label>
            <input 
              type="number" 
              min="0" 
              max="24"
              step="0.5"
              value={form.sleepHours}
              onChange={(e) => setForm({ ...form, sleepHours: Number(e.target.value) })}
              style={{ width: "100%", padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text)" }}
            />
            <p style={{ margin: "6px 0 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              How many hours did you sleep last night?
            </p>
          </div>

          {/* Study */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <StudyIcon size={18} color="var(--primary)" />
              <span style={{ fontSize: "0.95rem", fontWeight: "500" }}>
                Study: <strong>{form.studyHours}</strong>h
              </span>
            </label>
            <input 
              type="number" 
              min="0" 
              max="24"
              step="0.5"
              value={form.studyHours}
              onChange={(e) => setForm({ ...form, studyHours: Number(e.target.value) })}
              style={{ width: "100%", padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text)" }}
            />
            <p style={{ margin: "6px 0 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              How many hours did you study today?
            </p>
          </div>

          {/* Social */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <SocialIcon size={18} color="var(--secondary)" />
              <span style={{ fontSize: "0.95rem", fontWeight: "500" }}>
                Social: <strong>{form.socialRating}</strong>/5
              </span>
            </label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={form.socialRating}
              onChange={(e) => setForm({ ...form, socialRating: Number(e.target.value) })}
            />
            <p style={{ margin: "6px 0 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Did you connect with friends or family?
            </p>
          </div>
        </div>

        {/* Real-time Burnout Score */}
        {score && (
          <div className="resultBox" style={{ marginTop: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <p style={{ margin: "0 0 6px 0", fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600" }}>
                  Burnout Risk
                </p>
                <h2 style={{ margin: "0", fontSize: "2.4rem", lineHeight: "1" }}>{score.score}</h2>
              </div>
              <span className={`badge ${score.level}`}>
                {score.level}
              </span>
            </div>

            {score.contributors.length > 0 && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600" }}>
                  Contributing Factors
                </p>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {score.contributors.map((contributor: string) => (
                    <span
                      key={contributor}
                      style={{
                        background: "rgba(196, 93, 93, 0.15)",
                        color: "#e89898",
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: "500"
                      }}
                    >
                      {contributor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button 
          className="primaryBtn" 
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "14px", marginTop: "8px", fontWeight: "600" }}
        >
          {loading ? "Saving..." : "Save & Continue"}
        </button>
      </form>
      </main>
    </>
  );
}
