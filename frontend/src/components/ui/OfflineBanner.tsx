import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export const OfflineBanner = () => {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      style={{
        background: "var(--warning-soft, rgba(245,127,23,0.15))",
        color: "var(--warning, #f57f17)",
        padding: "6px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: "var(--t-sm, 12px)",
        fontWeight: 600,
        zIndex: 100,
      }}
    >
      <WifiOff size={14} />
      Offline · dados podem estar desatualizados
    </div>
  );
};
