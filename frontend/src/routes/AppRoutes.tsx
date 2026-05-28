import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@components/ProtectedRoute";
import { LoginPage } from "@pages/auth/LoginPage";
import { RegisterPage } from "@pages/auth/RegisterPage";
import { LandingPage } from "@features/landing";
import { DashboardPreviewPage } from "@features/landing/pages/DashboardPreviewPage";
import { MapPage } from "@pages/map/MapPage";
import { ProfilePage } from "@pages/profile/ProfilePage";
import { DashboardPage } from "@features/dashboard/pages/DashboardPage";
import { FarmsPage, FarmDetailPage } from "@features/farms";
import { CollarsPage, CollarDetailPage } from "@features/collars";
import { NotificationsPage } from "@features/notifications";
import { CowsPage, CowDetailPage } from "@features/cows";
import { AccessLayout, UsersPage, RolesPage, PermissionsPage } from "@features/access";

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/preview" element={<DashboardPreviewPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Farms */}
        <Route path="/farms" element={<FarmsPage />} />
        <Route path="/farms/:id" element={<FarmDetailPage />} />

        {/* Collars */}
        <Route path="/collars" element={<CollarsPage />} />
        <Route path="/collars/:id" element={<CollarDetailPage />} />

        {/* Cows */}
        <Route path="/cows" element={<CowsPage />} />
        <Route path="/cows/:id" element={<CowDetailPage />} />

        {/* Notifications */}
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Map & Profile */}
        <Route path="/map" element={<MapPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Access (Admin only) */}
        <Route path="/access" element={<AccessLayout />}>
          <Route path="users" element={<UsersPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="permissions" element={<PermissionsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
