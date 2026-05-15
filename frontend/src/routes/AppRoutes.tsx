import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@components/ProtectedRoute";
import { LoginPage } from "@pages/auth/LoginPage";
import { LandingPage } from "@features/landing";
import { HomePage } from "@pages/home/HomePage";
import { FarmsPage, FarmDetailPage } from "@features/farms";
import { CollarsPage, CollarDetailPage } from "@features/collars";
import { NotificationsPage } from "@features/notifications";
import { CowsPage, CowDetailPage } from "@features/cows";
import {
  AccessLayout,
  UsersPage,
  RolesPage,
  PermissionsPage,
} from "@features/access";
import { AppBar } from "@components/layout";

const DashboardPlaceholder = () => (
  <div className="app-page">
    <AppBar title="Dashboard" />
    <section style={{ padding: "var(--s-4)" }}>
      {/* TODO[IAN]: integrar componentes finais de dashboard e graficos */}
      <p>Dashboard em construção.</p>
    </section>
  </div>
);

const RegisterPlaceholder = () => (
  <section style={{ padding: "var(--s-4)" }}>
    {/* TODO[ANGELO]: implementar tela de registro de usuarios */}
    <p>Registro de usuários em construção.</p>
  </section>
);







export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPlaceholder />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPlaceholder />} />

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
