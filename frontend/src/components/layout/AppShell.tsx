import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { OfflineBanner } from "@components/ui/OfflineBanner";
import { FarmProvider } from "@/context/FarmContext";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";

const AppShellFrame = () => {
  const { theme } = useTheme();

  return (
    <div className="app-shell" data-theme={theme}>
      <Sidebar />
      <OfflineBanner />
      <main className="app-shell__main">
        <Outlet />
      </main>
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
