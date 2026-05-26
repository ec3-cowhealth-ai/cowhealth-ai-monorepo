import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { FarmProvider } from "@/context/FarmContext";

export const AppShell = () => {
  return (
    <FarmProvider>
      <div className="app-shell">
        <Sidebar />
        <div className="app-shell__main">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </FarmProvider>
  );
};
