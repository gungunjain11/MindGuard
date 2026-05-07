"use client";

import { useState } from "react";
import { createJournal } from "@/src/lib/firebase/firestore";
import { analyzeJournal } from "@/src/lib/api/journal";
import { useAuth } from "@/src/components/auth/AuthProvider";

export default function JournalForm() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !text.trim()) return;

    setSaving(true);
    const ref = await createJournal(user.uid, { text, source: "manual" });
    await analyzeJournal({ uid: user.uid, journalId: ref.id, text });
    setText("");
    setSaving(false);
  };

  return (
    <form className="card formGrid" onSubmit={handleSubmit}>
      <h1>Journal</h1>
      <textarea
        rows={8}
        placeholder="Write about your day, what stressed you, what went well, and what felt hard."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="primaryBtn" type="submit">
        {saving ? "Saving..." : "Save journal"}
      </button>
    </form>
  );
}
