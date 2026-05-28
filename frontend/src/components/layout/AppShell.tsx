import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { FarmProvider } from "@/context/FarmContext";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";

const AppShellFrame = () => {
  const { theme } = useTheme();

  return (
    <div className="app-shell" data-theme={theme}>
      <Sidebar />
      <div className="app-shell__main">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};

export const AppShell = () => {
  return (
    <ThemeProvider>
      <FarmProvider>
        <AppShellFrame />
      </FarmProvider>
    </ThemeProvider>
  );
};
