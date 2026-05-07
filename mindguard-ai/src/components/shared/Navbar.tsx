"use client";

import Link from "next/link";
import { useAuth } from "@/src/components/auth/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { logoutUser } from "@/src/lib/firebase/auth";
import { useState } from "react";
import {
  DashboardIcon,
  CheckinIcon,
  JournalIcon,
  WeeklyIcon,
  SettingsIcon,
  LogoutIcon
} from "@/src/components/icons";

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("uid");
      router.push("/");
    } catch (err: any) {
      console.error("Logout failed:", err);
    }
  };

  const isActive = (path: string) => pathname === path;

  // Only show navbar on authenticated pages
  if (!user) return null;

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
    { href: "/checkin", label: "Check-in", Icon: CheckinIcon },
    { href: "/journal", label: "Journal", Icon: JournalIcon },
    { href: "/weekly-review", label: "Weekly", Icon: WeeklyIcon },
    { href: "/settings", label: "Settings", Icon: SettingsIcon }
  ];

  return (
    <nav className="navbar">
      <Link href="/dashboard" className="brand">
        MindGuard
      </Link>

      <div className="navLinks">
        {navLinks.map((link) => {
          const Icon = link.Icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`navLink ${isActive(link.href) ? "active" : ""}`}
            >
              <Icon size={18} />
              <span style={{ display: "none" }}>{link.label}</span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="navLogout"
          title="Logout"
        >
          <LogoutIcon size={16} />
        </button>
      </div>
    </nav>
  );
}
