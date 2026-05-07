"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/src/components/shared/Navbar";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { logoutUser } from "@/src/lib/firebase/auth";
import { saveUserProfile } from "@/src/lib/firebase/firestore";
import { CheckIcon } from "@/src/components/icons";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState<any>({
    name: "",
    fieldOfStudy: "",
    semester: "",
    workload: "",
    studyStyle: "",
    baselineStress: 3,
    baselineSleep: 7
  });

  // Protect route and load profile
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user?.uid) {
      loadProfile();
    }
  }, [user, authLoading, router]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "users", user!.uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile(data);
        setEditForm({
          name: data.name || user!.displayName || "",
          fieldOfStudy: data.fieldOfStudy || "",
          semester: data.semester || "",
          workload: data.workload || "",
          studyStyle: data.studyStyle || "",
          baselineStress: data.baselineStress || 3,
          baselineSleep: data.baselineSleep || 7
        });
      } else {
        setProfile({
          email: user!.email,
          name: user!.displayName || ""
        });
        setEditForm({
          name: user!.displayName || "",
          fieldOfStudy: "",
          semester: "",
          workload: "",
          studyStyle: "",
          baselineStress: 3,
          baselineSleep: 7
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const uid = user?.uid;
      if (!uid) throw new Error("User not authenticated");

      await saveUserProfile(uid, editForm);
      setSuccess("Profile updated successfully!");
      setProfile(editForm);
      setEditMode(false);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("uid");
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <main className="pageWrap">
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p>Loading settings...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pageWrap">
      <h1 style={{ marginBottom: "8px" }}>Settings & Profile</h1>
      <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
        Manage your account, profile, and preferences.
      </p>

      {error && (
        <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.12)", borderRadius: "8px", color: "var(--danger)", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: "12px", background: "rgba(22, 163, 74, 0.12)", borderRadius: "8px", color: "#86efac", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckIcon size={16} />
          {success}
        </div>
      )}

      <div style={{ maxWidth: "600px" }}>
        {/* Account Section */}
        <div className="card" style={{ marginBottom: "16px" }}>
          <h2 style={{ margin: "0 0 16px 0", fontSize: "1.2rem" }}>Account</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            <div>
              <p style={{ margin: "0 0 6px 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                Email
              </p>
              <p style={{ margin: 0, fontSize: "0.95rem" }}>
                {user?.email || "No email"}
              </p>
            </div>
            <div>
              <p style={{ margin: "0 0 6px 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                Account Status
              </p>
              <p style={{ margin: 0, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckIcon size={16} style={{ color: "var(--success)" }} />
                <span style={{ color: "var(--success)" }}>Active</span>
              </p>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="card" style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Study Profile</h2>
            <button
              className="ghostBtn"
              onClick={() => setEditMode(!editMode)}
              style={{ fontSize: "0.9rem", padding: "8px 12px" }}
            >
              {editMode ? "Cancel" : "Edit"}
            </button>
          </div>

          {!editMode ? (
            <div style={{ display: "grid", gap: "12px" }}>
              <div>
                <p style={{ margin: "0 0 6px 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                  Name
                </p>
                <p style={{ margin: 0, fontSize: "0.95rem" }}>
                  {profile?.name || "Not set"}
                </p>
              </div>
              <div>
                <p style={{ margin: "0 0 6px 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                  Field of Study
                </p>
                <p style={{ margin: 0, fontSize: "0.95rem" }}>
                  {profile?.fieldOfStudy || "Not set"}
                </p>
              </div>
              <div>
                <p style={{ margin: "0 0 6px 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                  Semester
                </p>
                <p style={{ margin: 0, fontSize: "0.95rem" }}>
                  {profile?.semester || "Not set"}
                </p>
              </div>
              <div>
                <p style={{ margin: "0 0 6px 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                  Workload
                </p>
                <p style={{ margin: 0, fontSize: "0.95rem" }}>
                  {profile?.workload || "Not set"}
                </p>
              </div>
              <div>
                <p style={{ margin: "0 0 6px 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                  Study Style
                </p>
                <p style={{ margin: 0, fontSize: "0.95rem" }}>
                  {profile?.studyStyle || "Not set"}
                </p>
              </div>
            </div>
          ) : (
            <form className="formGrid" style={{ gap: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem" }}>
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem" }}>
                  Field of Study
                </label>
                <input
                  type="text"
                  value={editForm.fieldOfStudy}
                  onChange={(e) => setEditForm({ ...editForm, fieldOfStudy: e.target.value })}
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem" }}>
                  Semester
                </label>
                <input
                  type="text"
                  value={editForm.semester}
                  onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                  placeholder="e.g., 5th"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem" }}>
                  Workload
                </label>
                <input
                  type="text"
                  value={editForm.workload}
                  onChange={(e) => setEditForm({ ...editForm, workload: e.target.value })}
                  placeholder="e.g., Heavy, Moderate"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem" }}>
                  Study Style
                </label>
                <input
                  type="text"
                  value={editForm.studyStyle}
                  onChange={(e) => setEditForm({ ...editForm, studyStyle: e.target.value })}
                  placeholder="e.g., Visual, Kinesthetic"
                />
              </div>

              <button
                type="button"
                className="primaryBtn"
                onClick={handleSaveProfile}
                disabled={saving}
                style={{ width: "100%" }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}
        </div>

        {/* Privacy Section */}
        <div className="card" style={{ marginBottom: "16px" }}>
          <h2 style={{ margin: "0 0 16px 0", fontSize: "1.2rem" }}>Privacy & Data</h2>
          <div style={{ display: "grid", gap: "12px", fontSize: "0.9rem", color: "var(--muted)", lineHeight: "1.6" }}>
            <p style={{ margin: 0 }}>
              <strong>Your Data is Private:</strong> All your check-ins, journal entries, and insights are stored securely in Firestore and only accessible with your account.
            </p>
            <p style={{ margin: 0 }}>
              <strong>AI Analysis:</strong> Your journal entries may be processed by Gemini API to generate insights. No personal identifiers are shared.
            </p>
            <p style={{ margin: 0 }}>
              <strong>Data Deletion:</strong> Contact support to delete your account and all associated data permanently.
            </p>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="card" style={{ marginBottom: "16px" }}>
          <h2 style={{ margin: "0 0 16px 0", fontSize: "1.2rem" }}>Preferences</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
              <input type="checkbox" defaultChecked style={{ cursor: "pointer" }} />
              <span>Email reminder for daily check-in (coming soon)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
              <input type="checkbox" defaultChecked style={{ cursor: "pointer" }} />
              <span>Weekly summary email (coming soon)</span>
            </label>
          </div>
        </div>

        {/* Logout Section */}
        <div className="card" style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
          <h2 style={{ margin: "0 0 16px 0", fontSize: "1.2rem" }}>Session</h2>
          <button
            className="secondaryBtn"
            onClick={handleLogout}
            style={{ width: "100%" }}
          >
            Logout
          </button>
          <p style={{ margin: "12px 0 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
            You will be logged out from this device.
          </p>
        </div>

        {/* Help Links */}
        <div style={{ marginTop: "24px", padding: "16px", background: "rgba(255,255,255,0.04)", borderRadius: "12px", textAlign: "center" }}>
          <p style={{ margin: "0 0 12px 0", fontSize: "0.9rem", color: "var(--muted)" }}>
            Need help?
          </p>
          <Link href="/dashboard" className="ghostBtn" style={{ fontSize: "0.85rem" }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
      </main>
    </>
  );
}
