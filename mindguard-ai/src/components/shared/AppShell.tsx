import Navbar from "./Navbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="appShell">
      <Navbar />
      <main className="pageWrap">{children}</main>
    </div>
  );
}
