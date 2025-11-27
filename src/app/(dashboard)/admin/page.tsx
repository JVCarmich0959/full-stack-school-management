// app/(admin)/page.tsx
import type { FC } from "react";
import dynamic from "next/dynamic";
import Announcements from "@/components/Announcements";
import DataExchangePanel from "@/components/DataExchangePanel";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import NotificationsFeed from "@/components/NotificationsFeed";
import ReportingInsights from "@/components/ReportingInsights";
import UserCard from "@/components/UserCard";

// Defer heavy charts to client, no SSR to prevent hydration mismatch
const CountChartContainer = dynamic(() => import("@/components/CountChartContainer"), { ssr: false, loading: () => <div className="h-64 rounded-2xl bg-muted animate-pulse" /> });
const AttendanceChartContainer = dynamic(() => import("@/components/AttendanceChartContainer"), { ssr: false, loading: () => <div className="h-64 rounded-2xl bg-muted animate-pulse" /> });
const FinanceChart = dynamic(() => import("@/components/FinanceChart"), { ssr: false, loading: () => <div className="h-72 rounded-2xl bg-muted animate-pulse" /> });

type AdminPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

const AdminPage: FC<AdminPageProps> = ({ searchParams }) => {
  return (
    <div className="p-4 lg:p-6 grid gap-6 lg:gap-8 lg:grid-cols-3" role="main" aria-labelledby="dashboard-title">
      {/* LEFT (spans 2 cols on large) */}
      <section className="lg:col-span-2 grid gap-6" aria-label="Overview and analytics">
        <h1 id="dashboard-title" className="sr-only">Admin Dashboard</h1>

        {/* USER CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <UserCard type="admin" />
          <UserCard type="teacher" />
          <UserCard type="student" />
          <UserCard type="parent" />
        </div>

        {/* MIDDLE CHARTS */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 min-h-[clamp(280px,40vh,420px)]">
            <CountChartContainer />
          </div>
          <div className="lg:col-span-2 min-h-[clamp(280px,40vh,420px)]">
            <AttendanceChartContainer />
          </div>
        </div>

        {/* BOTTOM CHART */}
        <div className="min-h-[clamp(320px,45vh,520px)]">
          <FinanceChart />
        </div>

        <div className="grid lg:grid-cols-[1.5fr,1fr] gap-4">
          <ReportingInsights />
          <div className="grid gap-4 h-full">
            <NotificationsFeed />
            <DataExchangePanel />
          </div>
        </div>
      </section>

      {/* RIGHT RAIL */}
      <aside className="flex flex-col gap-6" aria-label="Calendar and announcements">
        <EventCalendarContainer searchParams={searchParams} />
        <Announcements />
      </aside>
    </div>
  );
};

export default AdminPage;
