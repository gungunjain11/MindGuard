"use client";

import { useState } from "react";
import { createCheckin } from "@/src/lib/firebase/firestore";
import { calculateBurnoutScore } from "@/src/lib/scoring/burnoutScore";
import { useAuth } from "@/src/components/auth/AuthProvider";

export default function CheckinForm() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    mood: 3,
    stress: 3,
    sleepHours: 7,
    studyHours: 5,
    socialRating: 3
  });

  const [result, setResult] = useState<{ score: number; level: string; contributors: string[] } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const burnout = calculateBurnoutScore(form);
    setResult(burnout);

    await createCheckin(user.uid, {
      date: new Date().toISOString().slice(0, 10),
      ...form,
      structuredRiskScore: burnout.score,
      structuredRiskLevel: burnout.level,
      contributors: burnout.contributors
    });
  };

  return (
    <form className="card formGrid" onSubmit={handleSubmit}>
      <h1>Daily Check-in</h1>
      <label>Mood (1-5)</label>
      <input type="range" min="1" max="5" value={form.mood} onChange={(e) => setForm({ ...form, mood: Number(e.target.value) })} />
      <label>Stress (1-5)</label>
      <input type="range" min="1" max="5" value={form.stress} onChange={(e) => setForm({ ...form, stress: Number(e.target.value) })} />
      <label>Sleep hours</label>
      <input type="number" value={form.sleepHours} onChange={(e) => setForm({ ...form, sleepHours: Number(e.target.value) })} />
      <label>Study hours</label>
      <input type="number" value={form.studyHours} onChange={(e) => setForm({ ...form, studyHours: Number(e.target.value) })} />
      <label>Social interaction (1-5)</label>
      <input type="range" min="1" max="5" value={form.socialRating} onChange={(e) => setForm({ ...form, socialRating: Number(e.target.value) })} />
      <button className="primaryBtn" type="submit">Save check-in</button>

      {result && (
        <div className="resultBox">
          <p>Risk score: {result.score}</p>
          <p>Risk level: {result.level}</p>
          <p>Top contributors: {result.contributors.join(", ") || "none"}</p>
        </div>
      )}
    </form>
  );
}
