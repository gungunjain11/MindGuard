"use client";

import Link from "next/link";
import { useAuth } from "@/src/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  CheckinIcon,
  JournalIcon,
  WeeklyIcon
} from "@/src/components/icons";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="centerScreen">
        <div className="card">Loading...</div>
      </main>
    );
  }

  return (
    <main className="landing">
      <section style={{ maxWidth: "920px", textAlign: "center" }}>
        {/* Hero Section */}
        <div className="heroCard" style={{ marginBottom: "72px" }}>
          <p className="eyebrow">Student Wellness Platform</p>
          <h1 style={{ marginBottom: "16px" }}>Track burnout before it becomes overwhelming</h1>
          <p className="heroText">
            MindGuard AI monitors your stress, sleep, mood, and study habits. Get AI-powered insights,
            actionable interventions, and weekly trends to maintain your wellbeing while excelling academically.
          </p>
          <div className="heroActions">
            <Link href="/signup" className="primaryBtn">
              Sign Up Free
            </Link>
            <Link href="/login" className="secondaryBtn">
              Login
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ marginBottom: "72px" }}>
          <h2 style={{ marginBottom: "12px", color: "var(--text)" }}>How It Works</h2>
          <p className="heroText" style={{ marginBottom: "40px", color: "var(--text-secondary)" }}>
            Complete the daily check-in loop: log your wellness metrics, discover patterns, receive actionable insights.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Feature 1 */}
            <div
              className="card"
              style={{
                padding: "32px 24px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                alignItems: "center"
              }}
            >
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "var(--surface-strong)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)"
              }}>
                <CheckinIcon size={28} />
              </div>
              <h3 style={{ margin: "8px 0 4px 0", fontSize: "1.1rem" }}>Daily Check-in</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                Log your mood, stress, sleep, study hours, and social connection. Instantly see your burnout risk score.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="card"
              style={{
                padding: "32px 24px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                alignItems: "center"
              }}
            >
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "var(--surface-strong)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--secondary)"
              }}>
                <JournalIcon size={28} />
              </div>
              <h3 style={{ margin: "8px 0 4px 0", fontSize: "1.1rem" }}>AI Insights</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                Reflect through journaling and let AI analyze emotions, stressors, and provide personalized recommendations.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="card"
              style={{
                padding: "32px 24px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                alignItems: "center"
              }}
            >
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "var(--surface-strong)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--tertiary)"
              }}>
                <WeeklyIcon size={28} />
              </div>
              <h3 style={{ margin: "8px 0 4px 0", fontSize: "1.1rem" }}>Weekly Review</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                Analyze patterns, identify triggers, and track progress. Get tailored recommendations for the next week.
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="card" style={{ padding: "40px 32px", marginBottom: "48px" }}>
          <h3 style={{ margin: "0 0 24px 0", fontSize: "1.2rem" }}>Built with Google Technology</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "18px",
            }}
          >
            <div style={{ padding: "16px", borderRight: "1px solid var(--border)" }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "var(--primary)", fontWeight: "600" }}>
                Firebase Auth
              </p>
              <p style={{ margin: "0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Secure authentication
              </p>
            </div>
            <div style={{ padding: "16px", borderRight: "1px solid var(--border)" }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "var(--secondary)", fontWeight: "600" }}>
                Firestore
              </p>
              <p style={{ margin: "0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Real-time database
              </p>
            </div>
            <div style={{ padding: "16px", borderRight: "1px solid var(--border)" }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "var(--tertiary)", fontWeight: "600" }}>
                Gemini API
              </p>
              <p style={{ margin: "0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                AI analysis engine
              </p>
            </div>
            <div style={{ padding: "16px" }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "0.9rem", color: "var(--primary-light)", fontWeight: "600" }}>
                Cloud Functions
              </p>
              <p style={{ margin: "0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Serverless backend
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="card" style={{ padding: "48px 32px", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 12px 0" }}>Take control of your wellness</h2>
          <p style={{ margin: "0 0 28px 0", color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
            Join students already using MindGuard to track their burnout and maintain balance. No credit card required.
          </p>
          <Link href="/signup" className="primaryBtn" style={{ justifyContent: "center" }}>
            Create Your Account Now
          </Link>
        </div>
      </section>
    </main>
  );
}
