/**
 * DashboardPage
 * TODO[IAN]: Implementar página de dashboard completa
 *
 * Estrutura esperada:
 * 1. Header com período seletor (hoje, semana, mês)
 * 2. Grid de KPI cards (total de vacas, saudáveis, em risco, doentes)
 * 3. Gráfico de visão geral (tendência)
 * 4. Gráfico de vacas por status (pizza)
 * 5. Gráfico de vacas por fazenda (barra)
 * 6. Seção de alertas recentes
 *
 * Integração com backend:
 * - GET /dashboard/overview (com parâmetro ?period=week)
 * - GET /dashboard/cows-per-status
 * - GET /dashboard/cows-per-farm
 */

import { AppBar } from '@components/layout';
import {
  DashboardKPICard,
  DashboardOverviewChart,
  CowsPerStatusChart,
  CowsPerFarmChart,
} from '../index';
import type { DashboardData } from '../types';

export const DashboardPage = () => {
  // TODO[IAN]: Implementar hooks para buscar dados:
  // const { data: dashboardData, isLoading } = useDashboardOverview();
  // const { data: cowsPerStatus } = useCowsPerStatus();
  // const { data: cowsPerFarm } = useCowsPerFarm();

  // Mock data para desenvolvimento
  const mockDashboardData: DashboardData = {
    totalCows: 150,
    healthyCows: 120,
    unhealthyCows: 30,
    totalFarms: 5,
    cowsPerStatus: [
      { label: 'Saudáveis', value: 120 },
      { label: 'Em Risco', value: 20 },
      { label: 'Doentes', value: 10 },
    ],
    cowsPerFarm: [
      { label: 'Fazenda A', value: 50 },
      { label: 'Fazenda B', value: 40 },
      { label: 'Fazenda C', value: 30 },
      { label: 'Fazenda D', value: 20 },
      { label: 'Fazenda E', value: 10 },
    ],
  };

  // TODO[IAN]: Implementar loading state
  // if (isLoading) return <LoadingSpinner />;

  return (
    <div className="app-page">
      <AppBar title="Dashboard" />

      <section style={{ padding: 'var(--s-4)' }}>
        {/* TODO[IAN]: Adicionar seletor de período */}
        <div className="period-selector">
          {/* <button>Hoje</button>
          <button>Semana</button>
          <button>Mês</button> */}
        </div>

        {/* KPI Cards */}
        {/* TODO[IAN]: Implementar grid responsivo com KPI cards */}
        <div className="kpi-grid">
          <DashboardKPICard
            title="Total de Vacas"
            value={mockDashboardData.totalCows}
            trend="up"
            trendPercent={5}
          />
          <DashboardKPICard
            title="Vacas Saudáveis"
            value={mockDashboardData.healthyCows}
            unit="%"
            trend="up"
            trendPercent={8}
          />
          <DashboardKPICard
            title="Em Risco"
            value={mockDashboardData.unhealthyCows}
            trend="down"
            trendPercent={3}
          />
          <DashboardKPICard
            title="Fazendas Ativas"
            value={mockDashboardData.totalFarms}
            trend="neutral"
          />
        </div>

        {/* Charts */}
        <div className="charts-grid">
          {/* TODO[IAN]: Implementar grid com 2-3 colunas dependendo de mobile/desktop */}
          <div className="chart-wrapper">
            <DashboardOverviewChart
              data={mockDashboardData.cowsPerStatus}
              title="Visão Geral — Últimos 7 dias"
              period="week"
            />
          </div>

          <div className="chart-wrapper">
            <CowsPerStatusChart data={mockDashboardData.cowsPerStatus} />
          </div>

          <div className="chart-wrapper">
            <CowsPerFarmChart data={mockDashboardData.cowsPerFarm} />
          </div>
        </div>

        {/* Recent Alerts */}
        {/* TODO[IAN]: Implementar seção de alertas recentes */}
        <div className="recent-alerts">
          <h3>Alertas Recentes</h3>
          <p>Nenhum alerta no momento</p>
        </div>
      </section>
    </div>
  );
};