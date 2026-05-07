"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import Navbar from "@/src/components/shared/Navbar";
import { getRecentCheckins } from "@/src/lib/firebase/firestore";
import { calculateTrendLabel } from "@/src/lib/scoring/trendScore";
import { TrendUpIcon, TrendDownIcon, StableIcon, AlertIcon, CheckIcon } from "@/src/components/icons";

export default function WeeklyReviewPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user?.uid) {
      fetchData();
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const uid = user?.uid;
      if (!uid) return;
      const recentCheckins = await getRecentCheckins(uid);
      setCheckins(recentCheckins);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (checkins.length === 0) {
      return {
        avgStress: 0,
        avgSleep: 0,
        avgStudy: 0,
        avgMood: 0,
        trend: "stable",
        topIssues: [],
        improvement: null,
        checkinsCount: 0
      };
    }

    const last7Days = checkins.slice(0, Math.min(7, checkins.length));
    const avgStress = parseFloat((last7Days.reduce((sum, c) => sum + (c.stress || 0), 0) / last7Days.length).toFixed(1));
    const avgSleep = parseFloat((last7Days.reduce((sum, c) => sum + (c.sleepHours || 0), 0) / last7Days.length).toFixed(1));
    const avgStudy = parseFloat((last7Days.reduce((sum, c) => sum + (c.studyHours || 0), 0) / last7Days.length).toFixed(1));
    const avgMood = parseFloat((last7Days.reduce((sum, c) => sum + (c.mood || 0), 0) / last7Days.length).toFixed(1));
    const trend = calculateTrendLabel(last7Days);

    let improvementMessage = "Not enough data yet";
    if (last7Days.length >= 2) {
      const firstDay = last7Days[last7Days.length - 1];
      const lastDay = last7Days[0];
      let improvement = 0;
      if (lastDay.mood > firstDay.mood) improvement++;
      if (lastDay.stress < firstDay.stress) improvement++;
      if (lastDay.sleepHours > firstDay.sleepHours) improvement++;
      if (improvement === 3) improvementMessage = "All metrics improved!";
      else if (improvement === 2) improvementMessage = "Most metrics improved!";
      else if (improvement === 1) improvementMessage = "Some progress made";
      else improvementMessage = "Mixed results";
    }

    const topIssues = [];
    const stressCount = last7Days.filter((c) => c.stress >= 4).length;
    const sleepCount = last7Days.filter((c) => c.sleepHours < 7).length;
    const moodCount = last7Days.filter((c) => c.mood <= 2).length;
    if (stressCount > 0) topIssues.push(`High stress (${stressCount}d)`);
    if (sleepCount > 0) topIssues.push(`Low sleep (${sleepCount}d)`);
    if (moodCount > 0) topIssues.push(`Low mood (${moodCount}d)`);

    return {
      avgStress,
      avgSleep,
      avgStudy,
      avgMood,
      trend,
      topIssues,
      improvement: improvementMessage,
      checkinsCount: last7Days.length
    };
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <main className="pageWrap">
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p>Loading your weekly review...</p>
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
            <p>Error loading weekly review: {error}</p>
          </div>
        </main>
      </>
    );
  }

  if (checkins.length === 0) {
    return (
      <>
        <Navbar />
        <main className="pageWrap">
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div className="card" style={{ maxWidth: "500px", margin: "0 auto", padding: "48px 32px" }}>
              <h2 style={{ marginBottom: "12px" }}>Not enough data yet</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "0" }}>
                Complete at least a few daily check-ins to see your weekly trends and patterns.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  const stats = calculateStats();

  const getTrendIcon = () => {
    if (stats.trend === "improving") return <TrendUpIcon size={18} />;
    if (stats.trend === "worsening") return <TrendDownIcon size={18} />;
    return <StableIcon size={18} />;
  };

  return (
    <>
      <Navbar />
      <main className="pageWrap">
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ marginBottom: "6px" }}>Weekly Review</h1>
        <p style={{ color: "var(--text-secondary)", margin: "0" }}>
          Analyze your trends, identify patterns, and get personalized recommendations.
        </p>
      </div>

      {/* Key Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px", marginBottom: "28px" }}>
        <div className="card" style={{ padding: "18px" }}>
          <p className="label" style={{ marginBottom: "8px" }}>Avg Stress</p>
          <h2 style={{ fontSize: "2.2rem", margin: "0", lineHeight: "1" }}>{stats.avgStress}</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "6px 0 0 0" }}>out of 5</p>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <p className="label" style={{ marginBottom: "8px" }}>Avg Sleep</p>
          <h2 style={{ fontSize: "2.2rem", margin: "0", lineHeight: "1" }}>{stats.avgSleep}</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "6px 0 0 0" }}>hours/night</p>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <p className="label" style={{ marginBottom: "8px" }}>Avg Study</p>
          <h2 style={{ fontSize: "2.2rem", margin: "0", lineHeight: "1" }}>{stats.avgStudy}</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "6px 0 0 0" }}>hours/day</p>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <p className="label" style={{ marginBottom: "8px" }}>Avg Mood</p>
          <h2 style={{ fontSize: "2.2rem", margin: "0", lineHeight: "1" }}>{stats.avgMood}</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "6px 0 0 0" }}>out of 5</p>
        </div>
      </div>

      {/* Trend & Improvement */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginBottom: "28px" }}>
        <div className="card">
          <p className="label">Weekly Trend</p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "14px 0" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "var(--surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: stats.trend === "improving" ? "var(--success)" : stats.trend === "worsening" ? "var(--danger)" : "var(--warning)"
            }}>
              {getTrendIcon()}
            </div>
            <h3 style={{ textTransform: "capitalize", margin: "0" }}>{stats.trend}</h3>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0" }}>
            {stats.trend === "improving" && "Your wellness is improving. Keep up the good work!"}
            {stats.trend === "worsening" && "Your stress is rising. Consider taking action."}
            {stats.trend === "stable" && "Your metrics remain stable. Stay consistent."}
          </p>
        </div>

        <div className="card">
          <p className="label">Weekly Progress</p>
          <h3 style={{ margin: "14px 0 8px 0", fontSize: "1rem" }}>
            {stats.improvement}
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0" }}>
            {stats.checkinsCount} check-ins logged
          </p>
        </div>
      </div>

      {/* Top Concerns */}
      {stats.topIssues.length > 0 && (
        <div className="card" style={{ marginBottom: "28px" }}>
          <p className="label">Top Concerns</p>
          <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {stats.topIssues.map((issue) => (
              <span
                key={issue}
                style={{
                  background: "rgba(212, 165, 111, 0.15)",
                  color: "#d4a56f",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <AlertIcon size={14} />
                {issue}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="card" style={{ marginBottom: "28px" }}>
        <p className="label">Personalized Recommendations</p>
        <div style={{ marginTop: "14px", display: "grid", gap: "12px" }}>
          {stats.avgStress >= 4 && (
            <div style={{
              padding: "12px 14px",
              background: "linear-gradient(135deg, rgba(79, 123, 167, 0.1), rgba(79, 123, 167, 0.05))",
              border: "1px solid rgba(79, 123, 167, 0.15)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.9rem",
              lineHeight: "1.5"
            }}>
              <strong style={{ color: "var(--primary-light)" }}>Stress Management:</strong> Try scheduling relaxation breaks, meditation, or talking to someone you trust.
            </div>
          )}
          {stats.avgSleep < 7 && (
            <div style={{
              padding: "12px 14px",
              background: "linear-gradient(135deg, rgba(90, 159, 139, 0.1), rgba(90, 159, 139, 0.05))",
              border: "1px solid rgba(90, 159, 139, 0.15)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.9rem",
              lineHeight: "1.5"
            }}>
              <strong style={{ color: "var(--secondary-light)" }}>Sleep Health:</strong> Aim for 7-9 hours. Set a consistent bedtime to improve sleep quality.
            </div>
          )}
          {stats.avgStudy > 8 && (
            <div style={{
              padding: "12px 14px",
              background: "linear-gradient(135deg, rgba(201, 132, 106, 0.1), rgba(201, 132, 106, 0.05))",
              border: "1px solid rgba(201, 132, 106, 0.15)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.9rem",
              lineHeight: "1.5"
            }}>
              <strong style={{ color: "var(--tertiary-light)" }}>Study Load:</strong> You've been studying heavily. Take regular breaks and prioritize self-care.
            </div>
          )}
          {stats.avgMood <= 2 && (
            <div style={{
              padding: "12px 14px",
              background: "linear-gradient(135deg, rgba(196, 93, 93, 0.1), rgba(196, 93, 93, 0.05))",
              border: "1px solid rgba(196, 93, 93, 0.15)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.9rem",
              lineHeight: "1.5"
            }}>
              <strong style={{ color: "#e89898" }}>Mood Support:</strong> Consider reaching out to friends or a counselor. Small positive activities help.
            </div>
          )}
          {stats.topIssues.length === 0 && (
            <div style={{
              padding: "12px 14px",
              background: "linear-gradient(135deg, rgba(90, 159, 139, 0.1), rgba(90, 159, 139, 0.05))",
              border: "1px solid rgba(90, 159, 139, 0.15)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.9rem",
              lineHeight: "1.5",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <CheckIcon size={16} style={{ color: "var(--secondary)" }} />
              <span><strong>You're doing great!</strong> Maintain your current routine and habits.</span>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Check-ins */}
      <div className="card">
        <p className="label">This Week's Check-ins</p>
        <div style={{ marginTop: "14px" }}>
          {checkins.slice(0, 7).map((checkin, idx) => {
            const date = checkin.createdAt
              ? new Date(checkin.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric"
                })
              : "Unknown";

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: idx < Math.min(7, checkins.length) - 1 ? "1px solid var(--border)" : "none"
                }}
              >
                <div>
                  <p style={{ margin: "0 0 4px 0", fontSize: "0.9rem", fontWeight: "500" }}>
                    {date}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Mood {checkin.mood}/5 · Stress {checkin.stress}/5 · Sleep {checkin.sleepHours}h · Study {checkin.studyHours}h
                  </p>
                </div>
                {checkin.structuredRiskScore !== undefined && (
                  <span className={`badge ${checkin.structuredRiskLevel || "low"}`}>
                    {checkin.structuredRiskScore}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      </main>
    </>
  );
}
