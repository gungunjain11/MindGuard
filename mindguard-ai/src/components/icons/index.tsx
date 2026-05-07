// Icon Components - Used throughout the app instead of emojis
// Soothing, minimal, professional design

export function DashboardIcon({ size = 24, className = "", color = "currentColor", style = {} }: { size?: number, className?: string, color?: string, style?: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={style} strokeWidth="2" className={className}>
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  );
}

export function CheckinIcon({ size = 24, className = "", color = "currentColor", style = {} }: { size?: number, className?: string, color?: string, style?: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={style} strokeWidth="2" className={className}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );
}

export function JournalIcon({ size = 24, className = "", color = "currentColor", style = {} }: { size?: number, className?: string, color?: string, style?: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={style} strokeWidth="2" className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  );
}

export function WeeklyIcon({ size = 24, className = "", color = "currentColor", style = {} }: { size?: number, className?: string, color?: string, style?: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={style} strokeWidth="2" className={className}>
      <polyline points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5 12 3"></polyline>
      <polyline points="12 12 20 7.5"></polyline>
      <polyline points="12 12 12 21"></polyline>
      <polyline points="12 12 4 7.5"></polyline>
    </svg>
  );
}

export function SettingsIcon({ size = 24, className = "", color = "currentColor", style = {} }: { size?: number, className?: string, color?: string, style?: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={style} strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"></path>
    </svg>
  );
}

export function MoodIcon({ size = 24, className = "", color = "currentColor", style = {} }: { size?: number, className?: string, color?: string, style?: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={style} strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
      <path d="M9 9h.01"></path>
      <path d="M15 9h.01"></path>
    </svg>
  );
}

export function StressIcon({ size = 24, className = "", color = "currentColor", style = {} }: { size?: number, className?: string, color?: string, style?: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={style} strokeWidth="2" className={className}>
      <path d="M9 2C6.5 2 4.5 4 4.5 6.5c0 2.5 2 4.5 4.5 4.5"></path>
      <path d="M15 2c2.5 0 4.5 2 4.5 4.5 0 2.5-2 4.5-4.5 4.5"></path>
      <path d="M6 13c-1.66 0-3 1.34-3 3s1.34 3 3 3"></path>
      <path d="M18 13c1.66 0 3 1.34 3 3s-1.34 3-3 3"></path>
      <path d="M9 13h6"></path>
    </svg>
  );
}

export function SleepIcon({ size = 24, className = "", color = "currentColor", style = {} }: { size?: number, className?: string, color?: string, style?: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={style} strokeWidth="2" className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );
}

export function StudyIcon({ size = 24, className = "", color = "currentColor", style = {} }: { size?: number, className?: string, color?: string, style?: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={style} strokeWidth="2" className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      <line x1="8" y1="7" x2="16" y2="7"></line>
      <line x1="8" y1="11" x2="16" y2="11"></line>
      <line x1="8" y1="15" x2="12" y2="15"></line>
    </svg>
  );
}

export function SocialIcon({ size = 24, className = "", color = "currentColor", style = {} }: { size?: number, className?: string, color?: string, style?: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={style} strokeWidth="2" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}

export function CheckIcon({ size = 24, className = "", color = "currentColor", style = {} }: { size?: number, className?: string, color?: string, style?: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={style} strokeWidth="3" className={className}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

export function AlertIcon({ size = 24, className = "", color = "currentColor", style = {} }: { size?: number, className?: string, color?: string, style?: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={style} strokeWidth="2" className={className}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  );
}

export function TrendUpIcon({ size = 24, className = "", color = "currentColor", style = {} }: { size?: number, className?: string, color?: string, style?: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={style} strokeWidth="2" className={className}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
}

export function TrendDownIcon({ size = 24, className = "", color = "currentColor", style = {} }: { size?: number, className?: string, color?: string, style?: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={style} strokeWidth="2" className={className}>
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
      <polyline points="17 18 23 18 23 12"></polyline>
    </svg>
  );
}

export function StableIcon({ size = 24, className = "", color = "currentColor", style = {} }: { size?: number, className?: string, color?: string, style?: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={style} strokeWidth="2" className={className}>
      <polyline points="1 12 5 12 9 3 15 21 19 12 23 12"></polyline>
    </svg>
  );
}

export function LogoutIcon({ size = 24, className = "", color = "currentColor", style = {} }: { size?: number, className?: string, color?: string, style?: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={style} strokeWidth="2" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  );
}
