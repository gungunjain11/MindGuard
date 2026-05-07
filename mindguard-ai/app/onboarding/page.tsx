"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveUserProfile } from "@/src/lib/firebase/firestore";

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fieldOfStudy: "",
    semester: "",
    workload: "",
    studyStyle: "",
    baselineStress: 3,
    baselineSleep: 7
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Get user ID from localStorage (set by AuthProvider)
      const uid = localStorage.getItem("uid");
      if (!uid) {
        setError("User not logged in");
        setLoading(false);
        return;
      }
      
      await saveUserProfile(uid, form);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to save onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pageWrap">
      <form className="card formGrid" onSubmit={handleSubmit}>
        <h1>Onboarding</h1>
        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
        
        <label>Field of Study</label>
        <input 
          placeholder="e.g., Computer Science" 
          value={form.fieldOfStudy}
          onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })} 
        />
        
        <label>Semester</label>
        <input 
          placeholder="e.g., 5th" 
          value={form.semester}
          onChange={(e) => setForm({ ...form, semester: e.target.value })} 
        />
        
        <label>Workload</label>
        <input 
          placeholder="e.g., Heavy, Moderate, Light" 
          value={form.workload}
          onChange={(e) => setForm({ ...form, workload: e.target.value })} 
        />
        
        <label>Study Style</label>
        <input 
          placeholder="e.g., Visual, Kinesthetic, Auditory" 
          value={form.studyStyle}
          onChange={(e) => setForm({ ...form, studyStyle: e.target.value })} 
        />
        
        <label>Baseline Stress Level (1-5)</label>
        <input 
          type="range" 
          min="1" 
          max="5" 
          value={form.baselineStress}
          onChange={(e) => setForm({ ...form, baselineStress: Number(e.target.value) })} 
        />
        <span>{form.baselineStress}</span>
        
        <label>Baseline Sleep Hours</label>
        <input 
          type="number" 
          min="0" 
          max="24" 
          value={form.baselineSleep}
          onChange={(e) => setForm({ ...form, baselineSleep: Number(e.target.value) })} 
        />
        
        <button className="primaryBtn" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save onboarding"}
        </button>
      </form>
    </main>
  );
}
