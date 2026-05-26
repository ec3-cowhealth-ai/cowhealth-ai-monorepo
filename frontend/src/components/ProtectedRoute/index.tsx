import { Navigate } from "react-router-dom";
import { useMe } from "../../hooks/useAuth";
import { useHasPermission } from "../../hooks/usePermissions";

interface ProtectedRouteProps {
    permission?: string;
}

export const ProtectedRoute = ({ permission }: ProtectedRouteProps) => {
    const { data: user, isLoading } = useMe();
    const hasPermission = useHasPermission(permission || "");

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-green-200 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

  if (!user) return <Navigate to="/login" replace />;

    if (permission && !hasPermission) {
        return <Navigate to="/" replace />; // Or a Forbidden page
    }

    return <Outlet />;
};
