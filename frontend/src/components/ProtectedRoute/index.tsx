import { Navigate } from "react-router-dom";
import { useMe } from "../../hooks/useAuth";
import { AppShell } from "../layout";
import { LoadingSpinner } from "../common";

export const ProtectedRoute = () => {
  const { data: user, isLoading } = useMe();

  if (isLoading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
        }}
      >
        <LoadingSpinner />
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

  return <AppShell />;
};