"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import Navbar from "@/src/components/shared/Navbar";
import { createJournal, getRecentCheckins } from "@/src/lib/firebase/firestore";
import { analyzeJournal } from "@/src/lib/api/journal";
import { CheckinIcon, CheckIcon } from "@/src/components/icons";

export default function JournalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const prompts = [
    "What stressed you today?",
    "What went well?",
    "What felt draining or difficult?",
    "How did you manage your time?",
    "Who did you connect with?",
    "What are you grateful for?"
  ];

  // Protect route and load history
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user?.uid) {
      loadHistory();
    }
  }, [user, authLoading, router]);

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const uid = user?.uid;
      if (!uid) return;

      // For now, we'll load recent check-ins to show activity history
      // In a full implementation, this would load journal entries
      const recentData = await getRecentCheckins(uid);
      setHistory(recentData.slice(0, 5));
    } catch (err: any) {
      console.error("Error loading history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please write something in your journal.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const uid = user?.uid;
      if (!uid) throw new Error("User not authenticated");

      const docRef = await createJournal(uid, {
        text: text.trim(),
        source: "manual",
        wordCount: text.split(/\s+/).length,
        emotions: [],
        stressors: [],
        analyzed: false
      });

      // TRIGGER THE AI RAG PIPELINE
      try {
        await analyzeJournal({ uid, journalId: docRef.id, text: text.trim() });
      } catch (aiError) {
        console.error("AI analysis failed, but journal was saved:", aiError);
      }

      setSubmitted(true);
      setText("");

      // Reload history
      await loadHistory();

      // Reset submitted state after 2 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to save journal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || historyLoading) {
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

  return (
    <>
      <Navbar />
      <main className="pageWrap">
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ marginBottom: "6px" }}>Journal</h1>
          <p style={{ color: "var(--text-secondary)", margin: "0" }}>
            Reflect on your thoughts and emotions. Writing helps process experiences and identify patterns.
          </p>
        </div>

        {/* Prompts */}
        <div style={{ marginBottom: "28px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
            Writing Prompts
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setText((prev) => (prev ? prev + "\n\n" : "") + prompt + " ")}
                className="ghostBtn"
                style={{ fontSize: "0.85rem" }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Journal Form */}
        <form className="card formGrid" onSubmit={handleSubmit} style={{ marginBottom: "28px" }}>
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

          {submitted && (
            <div style={{
              padding: "12px 14px",
              background: "rgba(90, 159, 139, 0.12)",
              borderRadius: "var(--radius-sm)",
              color: "var(--secondary-light)",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <CheckIcon size={16} />
              Journal entry saved! AI analysis will be available soon.
            </div>
          )}

          <textarea
            rows={10}
            placeholder={`What's on your mind today?`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              padding: "14px",
              borderRadius: "var(--radius-sm)",
              fontFamily: "inherit",
              resize: "vertical",
              fontSize: "0.95rem",
              lineHeight: "1.6"
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {text.length > 0 ? `${text.split(/\s+/).filter(w => w).length} words` : ""}
            </p>
            <button 
              className="primaryBtn" 
              type="submit"
              disabled={loading || !text.trim()}
            >
              {loading ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </form>

        {/* Journal History */}
        {history.length > 0 && (
          <div className="card">
            <p className="label">Recent Activity</p>
            <div style={{ marginTop: "14px" }}>
              {history.map((entry, idx) => {
                const date = entry.createdAt
                  ? new Date(entry.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric"
                    })
                  : "Unknown date";

                return (
                  <div
                    key={idx}
                    style={{
                      padding: "12px 0",
                      borderBottom: idx < history.length - 1 ? "1px solid var(--border)" : "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "var(--surface)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--primary)",
                        flexShrink: 0
                      }}>
                        <CheckinIcon size={16} />
                      </div>
                      <div>
                        <p style={{ margin: "0 0 2px 0", fontSize: "0.9rem", fontWeight: "500" }}>
                          Check-in Logged
                        </p>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          {date}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Mood {entry.mood || "-"}/5
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      </main>
    </>
  );
}
