import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "../../hooks/useAuth";

export const ProtectedRoute = () => {
    const { data: user, isLoading } = useMe();

    if (isLoading) return <p>Carregando...</p>;

    if (!user) return <Navigate to="/login" replace />;

    return <Outlet />;
};