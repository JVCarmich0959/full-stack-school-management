// app/(admin)/page.tsx
import type { FC } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

import Announcements from "@/components/Announcements";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import UserCard from "@/components/UserCard";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";

// Defer heavy charts to client, no SSR to prevent hydration mismatch
const CountChartContainer = dynamic(() => import("@/components/CountChartContainer"), { ssr: false, loading: () => <div className="h-64 rounded-2xl bg-muted animate-pulse" /> });
const AttendanceChartContainer = dynamic(() => import("@/components/AttendanceChartContainer"), { ssr: false, loading: () => <div className="h-64 rounded-2xl bg-muted animate-pulse" /> });
const FinanceChart = dynamic(() => import("@/components/FinanceChart"), { ssr: false, loading: () => <div className="h-72 rounded-2xl bg-muted animate-pulse" /> });

type AdminPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

const AdminPage: FC<AdminPageProps> = ({ searchParams }) => {
  const normalizedSearchParams = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ])
  ) as { [key: string]: string | undefined };

  return (
    <div className="space-y-6" role="main" aria-labelledby="dashboard-title">
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
              Invite teacher
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <section className="lg:col-span-2 space-y-6" aria-label="Overview and analytics">
          <h1 id="dashboard-title" className="sr-only">
            Admin Dashboard
          </h1>

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
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <UserCard type="admin" />
              <UserCard type="teacher" />
              <UserCard type="student" />
              <UserCard type="parent" />
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1 min-h-[clamp(280px,40vh,420px)]">
              <CountChartContainer />
            </Card>
            <Card className="lg:col-span-2 min-h-[clamp(280px,40vh,420px)]">
              <AttendanceChartContainer />
            </Card>
          </div>

          <Card className="min-h-[clamp(320px,45vh,520px)]">
            <FinanceChart />
          </Card>
        </section>

        <aside className="flex flex-col gap-6" aria-label="Calendar and announcements">
          <Card className="p-0">
            <EventCalendarContainer searchParams={normalizedSearchParams} />
          </Card>
          <Card>
            <Announcements />
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default AdminPage;
