import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

// Three-column app layout: communities nav on the left, feed in the center,
// contextual widgets on the right. Sidebars collapse on narrower screens.
export default function AppShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar sidebar-left">
        <LeftSidebar />
      </aside>
      <main className="shell-main">
        <Outlet />
      </main>
      <aside className="sidebar sidebar-right">
        <RightSidebar />
      </aside>
    </div>
  );
}
