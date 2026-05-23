// app/(admin)/page.tsx
import dynamic from "next/dynamic";
import Link from "next/link";

import Announcements from "@/components/Announcements";
import DataExchangePanel from "@/components/DataExchangePanel";
import DashboardTile from "@/components/DashboardTile";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import NotificationsFeed from "@/components/NotificationsFeed";
import ReportingInsights from "@/components/ReportingInsights";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import {
  getDashboardCounts,
  getDashboardMetrics,
} from "@/server/services/dashboardService";

// Defer heavy charts to client, no SSR to prevent hydration mismatch
const CountChartContainer = dynamic(
  () => import("@/components/CountChartContainer"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-2xl bg-muted animate-pulse" />
    ),
  },
);

const AttendanceChartContainer = dynamic(
  () => import("@/components/AttendanceChartContainer"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-2xl bg-muted animate-pulse" />
    ),
  },
);

const FinanceChart = dynamic(() => import("@/components/FinanceChart"), {
  ssr: false,
  loading: () => (
    <div className="h-72 rounded-2xl bg-muted animate-pulse" />
  ),
});

type AdminPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

type NormalizedSearchParams = Record<string, string | undefined>;

const normalizeSearchParams = (
  params: AdminPageProps["searchParams"]
): NormalizedSearchParams =>
  Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ])
  ) as NormalizedSearchParams;

const AdminPage = async ({ searchParams }: AdminPageProps) => {
  const normalizedSearchParams = normalizeSearchParams(searchParams);
  const [dashboard, metrics] = await Promise.all([
    getDashboardCounts(),
    getDashboardMetrics(),
  ]);

  return (
    <main className="space-y-6" aria-labelledby="dashboard-title">
      <h1 id="dashboard-title" className="sr-only">
        Admin Dashboard
      </h1>

      <PageHeader
        title="Leadership cockpit"
        subtitle="Monitor enrollment, instructional health, and family communications at a glance."
        actions={
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              href="/list/students"
              className="rounded-full border border-[var(--color-border)] px-4 py-2 font-medium text-[color:var(--color-text-primary)] transition hover:border-[var(--color-accent-primary)]"
            >
              View students
            </Link>
            <Link
              href="/list/teachers"
              className="rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-semibold text-[#271b70] shadow-sm transition hover:opacity-90"
            >
              View teachers
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <section
          className="lg:col-span-2 space-y-6"
          aria-label="Overview and analytics"
        >
          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
                  Community
                </p>
                <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                  Snapshot
                </h2>
              </div>
              <Link
                href="/list/parents"
                className="text-xs font-semibold text-[var(--color-accent-primary)]"
              >
                View roster
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {dashboard.tiles.map((tile) => (
                <DashboardTile key={tile.key} tile={tile} />
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
            <Card className="lg:col-span-1 min-h-[clamp(280px,40vh,420px)] min-w-0">
              <CountChartContainer />
            </Card>
            <Card className="lg:col-span-1 min-h-[clamp(280px,40vh,420px)] min-w-0">
              <AttendanceChartContainer />
            </Card>
          </div>

          <Card className="min-h-[clamp(320px,45vh,520px)] min-w-0">
            <FinanceChart />
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-w-0">
            <div className="grid gap-4 min-w-0 xl:col-span-2">
              <ReportingInsights metrics={metrics} />
            </div>
            <div className="grid gap-4 min-w-0">
              <Card className="p-0 min-w-0">
                <NotificationsFeed />
              </Card>
              <Card className="p-0 min-w-0">
                <DataExchangePanel />
              </Card>
            </div>
          </div>
        </section>
        <aside
          className="flex flex-col gap-6 min-w-0"
          aria-label="Calendar and announcements"
        >
          <Card padding="none" className="p-0 min-w-0">
            <EventCalendarContainer searchParams={normalizedSearchParams} />
          </Card>
          <Card className="min-w-0">
            <Announcements />
          </Card>
        </aside>
      </div>
    </main>
  );
};

export default AdminPage;
