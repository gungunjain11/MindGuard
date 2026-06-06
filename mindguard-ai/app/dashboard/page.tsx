"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/src/components/shared/Navbar";
import { getRecentCheckins, getRecentInsights, getRecentWeeklyReviews } from "@/src/lib/firebase/firestore";
import { calculateBurnoutScore } from "@/src/lib/scoring/burnoutScore";
import { calculateTrendLabel } from "@/src/lib/scoring/trendScore";
import {
  CheckinIcon,
  JournalIcon,
  WeeklyIcon,
  SettingsIcon,
  TrendUpIcon,
  TrendDownIcon,
  StableIcon,
  BrainIcon
} from "@/src/components/icons";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checkins, setCheckins] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const uid = user.uid;
        const [checkinsData, insightsData, reviewsData] = await Promise.all([
          getRecentCheckins(uid),
          getRecentInsights(uid),
          getRecentWeeklyReviews(uid)
        ]);

        setCheckins(checkinsData);
        setInsights(insightsData);
        setReviews(reviewsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <main className="pageWrap">
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p>Loading your dashboard...</p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="pageWrap">
          <div className="card" style={{ padding: "32px", textAlign: "center", color: "var(--danger)" }}>
            <p>Error loading dashboard: {error}</p>
          </div>
        </main>
      </>
    );
  }

  const latestCheckin = checkins[0];
  const latestInsight = insights[0];
  const latestReview = reviews[0];

  // Calculate burnout score from latest check-in
  let burnoutScore = null;
  let burnoutTrend = "stable";
  if (latestCheckin) {
    burnoutScore = calculateBurnoutScore({
      mood: latestCheckin.mood || 3,
      stress: latestCheckin.stress || 3,
      sleepHours: latestCheckin.sleepHours || 7,
      studyHours: latestCheckin.studyHours || 5,
      socialRating: latestCheckin.socialRating || 3
    });
  }

  if (checkins.length >= 2) {
    burnoutTrend = calculateTrendLabel(checkins.slice(0, Math.min(5, checkins.length)));
  }

  // Empty state
  if (checkins.length === 0) {
    return (
      <>
        <Navbar />
        <main className="pageWrap">
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div className="card" style={{ maxWidth: "500px", margin: "0 auto", padding: "48px 32px" }}>
              <h2 style={{ marginBottom: "12px" }}>Welcome to MindGuard</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
                Start by completing your first check-in to see your burnout risk score, trends, and AI insights.
              </p>
              <Link href="/checkin" className="primaryBtn" style={{ justifyContent: "center" }}>
                Complete Your First Check-in
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const getTrendIcon = () => {
    if (burnoutTrend === "improving") return <TrendUpIcon size={20} />;
    if (burnoutTrend === "worsening") return <TrendDownIcon size={20} />;
    return <StableIcon size={20} />;
  };

  return (
    <>
      <Navbar />
      <main className="pageWrap">
      <h1 style={{ marginBottom: "28px" }}>Dashboard</h1>

      <section className="dashboardGrid">
        {/* Current Risk Score */}
        <div className="card riskCard">
          <p className="label">Burnout Risk</p>
          <h2 style={{ fontSize: "3.5rem", margin: "8px 0", lineHeight: "1" }}>
            {burnoutScore?.score ?? 0}
          </h2>
          <span className={`badge ${burnoutScore?.level ?? "low"}`}>
            {burnoutScore?.level ?? "low"}
          </span>
          {burnoutScore?.contributors && burnoutScore.contributors.length > 0 && (
            <div style={{ marginTop: "18px", fontSize: "0.85rem" }}>
              <p style={{ color: "var(--text-muted)", margin: "0 0 10px 0", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Contributing Factors
              </p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {burnoutScore.contributors.map((contributor) => (
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

        {/* Trend */}
        <div className="card">
          <p className="label">Wellness Trend</p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: `var(--surface-strong)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: burnoutTrend === "improving" ? "var(--success)" : burnoutTrend === "worsening" ? "var(--danger)" : "var(--warning)"
            }}>
              {getTrendIcon()}
            </div>
            <h2 style={{ textTransform: "capitalize", margin: "0" }}>
              {burnoutTrend}
            </h2>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
            {burnoutTrend === "improving" && "Your wellness is improving. Keep it up!"}
            {burnoutTrend === "worsening" && "Your stress is rising. Consider taking action."}
            {burnoutTrend === "stable" && "Your wellness is stable. Stay consistent."}
          </p>
        </div>

        {/* Latest Insight */}
        <div className="card fullSpan">
          <p className="label">AI Insights</p>
          {latestInsight ? (
            <>
              {latestInsight.chainOfThought && (
                <div style={{
                  marginBottom: "16px",
                  padding: "12px",
                  background: "var(--surface)",
                  borderLeft: "3px solid var(--tertiary)",
                  borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  color: "var(--text-muted)"
                }}>
                  <p style={{ display: "flex", alignItems: "center", gap: "6px", margin: "0 0 6px 0", fontWeight: "600", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", color: "var(--tertiary)" }}>
                    <BrainIcon size={14} /> AI Thought Process (XAI)
                  </p>
                  <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                    {latestInsight.chainOfThought}
                  </p>
                </div>
              )}
              <h3 style={{ margin: "14px 0 10px 0" }}>Analysis</h3>
              <p style={{ margin: "0 0 18px 0", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                {latestInsight.aiSummary || "No analysis available yet."}
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "14px",
                marginTop: "16px"
              }}>
                <div style={{
                  padding: "14px",
                  background: "linear-gradient(135deg, rgba(79, 123, 167, 0.1), rgba(79, 123, 167, 0.05))",
                  border: "1px solid rgba(79, 123, 167, 0.2)",
                  borderRadius: "var(--radius-sm)"
                }}>
                  <p style={{ margin: "0 0 8px 0", fontSize: "0.8rem", color: "var(--primary-light)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Right now
                  </p>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                    {latestInsight.immediateAction || "Take a 10-min break."}
                  </p>
                </div>
                <div style={{
                  padding: "14px",
                  background: "linear-gradient(135deg, rgba(90, 159, 139, 0.1), rgba(90, 159, 139, 0.05))",
                  border: "1px solid rgba(90, 159, 139, 0.2)",
                  borderRadius: "var(--radius-sm)"
                }}>
                  <p style={{ margin: "0 0 8px 0", fontSize: "0.8rem", color: "var(--secondary-light)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    This week
                  </p>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                    {latestInsight.weeklyAction || "Schedule 3 social activities."}
                  </p>
                </div>
              </div>
              
              {latestInsight.ragContextDetails && latestInsight.ragContextDetails.length > 0 && (
                <div style={{
                  marginTop: "16px",
                  padding: "10px 14px",
                  background: "rgba(90, 159, 139, 0.05)",
                  border: "1px dashed rgba(90, 159, 139, 0.3)",
                  borderRadius: "var(--radius-sm)",
                }}>
                  <p style={{ margin: "0 0 8px 0", fontSize: "0.75rem", color: "var(--secondary-light)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    🔍 RAG Retrieval Metrics (gemini-embedding-2)
                  </p>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {latestInsight.ragContextDetails.map((rag: any, idx: number) => (
                      <div key={idx} style={{ fontSize: "0.8rem", color: "var(--text-secondary)", background: "var(--surface)", padding: "4px 8px", borderRadius: "4px" }}>
                        Entry {rag.daysAgo === 0 ? "Today" : `${rag.daysAgo}d ago`} • <strong>Cosine Sim: {(rag.similarity * 100).toFixed(1)}%</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: "var(--text-secondary)" }}>
              Write a journal entry to get AI-powered insights and personalized recommendations.
            </p>
          )}
        </div>

        {/* Recent Check-ins */}
        <div className="card fullSpan">
          <p className="label">Recent Activity</p>
          {checkins.length > 0 ? (
            <div style={{ marginTop: "14px" }}>
              {checkins.slice(0, 5).map((checkin, idx) => {
                const date = checkin.createdAt
                  ? new Date(checkin.createdAt.seconds * 1000).toLocaleDateString()
                  : "Unknown date";
                const score = calculateBurnoutScore({
                  mood: checkin.mood || 3,
                  stress: checkin.stress || 3,
                  sleepHours: checkin.sleepHours || 7,
                  studyHours: checkin.studyHours || 5,
                  socialRating: checkin.socialRating || 3
                });
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: idx < 4 ? "1px solid var(--border)" : "none"
                    }}
                  >
                    <div>
                      <p style={{ margin: "0 0 4px 0", fontSize: "0.9rem", color: "var(--text)", fontWeight: "500" }}>
                        {date}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Mood {checkin.mood}/5 · Stress {checkin.stress}/5 · Sleep {checkin.sleepHours}h
                      </p>
                    </div>
                    <span className={`badge ${score.level}`}>{score.score}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "var(--text-secondary)" }}>No check-ins yet.</p>
          )}
        </div>

        {/* Weekly Summary */}
        {latestReview && (
          <div className="card fullSpan">
            <p className="label">Weekly Summary</p>
            <h3 style={{ margin: "14px 0 16px 0" }}>This Week's Overview</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px", marginBottom: "18px" }}>
              <div style={{ padding: "12px", background: "var(--surface)", borderRadius: "var(--radius-sm)" }}>
                <p style={{ margin: "0 0 6px 0", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Avg Stress</p>
                <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: "700", color: "var(--tertiary)" }}>
                  {latestReview.averageStress?.toFixed(1) ?? "-"}
                </p>
              </div>
              <div style={{ padding: "12px", background: "var(--surface)", borderRadius: "var(--radius-sm)" }}>
                <p style={{ margin: "0 0 6px 0", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Avg Sleep</p>
                <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: "700", color: "var(--secondary)" }}>
                  {latestReview.averageSleep?.toFixed(1) ?? "-"}h
                </p>
              </div>
              <div style={{ padding: "12px", background: "var(--surface)", borderRadius: "var(--radius-sm)" }}>
                <p style={{ margin: "0 0 6px 0", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Trend</p>
                <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: "700", color: "var(--primary)", textTransform: "capitalize" }}>
                  {latestReview.consistencyTrend ?? "-"}
                </p>
              </div>
            </div>
            <p style={{ margin: "0 0 14px 0", fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
              {latestReview.aiExplanation}
            </p>
            <div style={{
              padding: "12px 14px",
              background: "linear-gradient(135deg, rgba(79, 123, 167, 0.1), rgba(79, 123, 167, 0.05))",
              border: "1px solid rgba(79, 123, 167, 0.15)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem"
            }}>
              <strong style={{ color: "var(--primary-light)" }}>Next week: </strong>
              <span style={{ color: "var(--text-secondary)" }}>
                {latestReview.nextWeekRecommendation}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <div style={{ marginTop: "36px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "12px" }}>
        <Link href="/checkin" className="secondaryBtn" style={{ justifyContent: "center", gap: "6px" }}>
          <CheckinIcon size={18} />
          <span>Check-in</span>
        </Link>
        <Link href="/journal" className="secondaryBtn" style={{ justifyContent: "center", gap: "6px" }}>
          <JournalIcon size={18} />
          <span>Journal</span>
        </Link>
        <Link href="/weekly-review" className="secondaryBtn" style={{ justifyContent: "center", gap: "6px" }}>
          <WeeklyIcon size={18} />
          <span>Weekly</span>
        </Link>
        <Link href="/settings" className="secondaryBtn" style={{ justifyContent: "center", gap: "6px" }}>
          <SettingsIcon size={18} />
          <span>Settings</span>
        </Link>
      </div>
      </main>
    </>
  );
}
