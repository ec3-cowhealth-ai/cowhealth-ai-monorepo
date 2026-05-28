import { Navigate } from "react-router-dom";
import { useMe } from "../../hooks/useAuth";
import { AppShell } from "../layout";
import { LoadingSpinner } from "../common";

export const ProtectedRoute = () => {
  const { data: user, isLoading, isError } = useMe();
  const token = localStorage.getItem("token");

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

  if (!token || (!user && !isLoading && isError)) {
    return <Navigate to="/login" replace />;
  }

  if (!user && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  return <AppShell />;
};
