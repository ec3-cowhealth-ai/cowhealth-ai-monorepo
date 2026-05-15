import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

export const AppShell = () => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__main">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};
