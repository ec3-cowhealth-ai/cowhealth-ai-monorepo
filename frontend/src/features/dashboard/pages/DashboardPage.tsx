import { AppBar } from "@components/layout";
import { LoadingSpinner } from "@components/common";
import {
  DashboardKPICard,
  CowsPerStatusChart,
  CowsPerFarmChart,
  DashboardOverviewChart,
} from "../index";
import { useDashboardOverview, useCowsPerStatus, useCowsPerFarm } from "../hooks/useDashboard";

export const DashboardPage = () => {
  const { data: overview, isLoading: loadingOverview } = useDashboardOverview();
  const { data: cowsPerStatus, isLoading: loadingStatus } = useCowsPerStatus();
  const { data: cowsPerFarm, isLoading: loadingFarm } = useCowsPerFarm();

  if (loadingOverview || loadingStatus || loadingFarm) {
    return (
      <div className="app-page">
        <AppBar title="Dashboard" />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const statusData = (cowsPerStatus ?? []).map((item) => ({
    label: item.status,
    value: item.count,
  }));

  const farmData = (cowsPerFarm ?? []).map((item) => ({
    label: item.name,
    value: item.cowCount,
  }));

  return (
    <div className="app-page">
      <AppBar title="Dashboard" />

      <section
        style={{
          padding: "var(--s-4)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--s-5)",
        }}
      >
        <div className="grid grid--4">
          <DashboardKPICard title="Total de Vacas" value={overview?.totalCows ?? 0} />
          <DashboardKPICard title="Com Colar" value={overview?.cowsWithCollar ?? 0} />
          <DashboardKPICard
            title="Em Alerta"
            value={overview?.cowsInAlert ?? 0}
            trend={overview && overview.cowsInAlert > 0 ? "down" : "neutral"}
          />
          <DashboardKPICard title="Fazendas Ativas" value={overview?.totalFarms ?? 0} />
          <DashboardKPICard title="Colares Ativos" value={overview?.totalActiveCollars ?? 0} />
          <DashboardKPICard
            title="Alertas Nao Lidos"
            value={overview?.unreadNotifications ?? 0}
            trend={overview && overview.unreadNotifications > 0 ? "down" : "neutral"}
          />
        </div>

        <div className="grid grid--2">
          <CowsPerStatusChart data={statusData} />
          <CowsPerFarmChart data={farmData} />
        </div>

        <DashboardOverviewChart />
      </section>
    </div>
  );
};
