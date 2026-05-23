import prisma from "@/lib/prisma";

export const DEFAULT_DASHBOARD_YEAR = "2025-26";

export type DashboardTileKey = "admin" | "teacher" | "student" | "parent";

type TileDefinition = {
  label: string;
  description: string;
  tooltip: string;
  href: (year: string) => string;
};

const TILE_DEFINITIONS: Record<DashboardTileKey, TileDefinition> = {
  admin: {
    label: "Admins",
    description: "Leadership team members with full cockpit access.",
    tooltip:
      "Counts every admin account that can sign into the leadership cockpit (no archived admins).",
    href: () => "/admin",
  },
  teacher: {
    label: "Teachers",
    description: "Certified teachers assigned to the current academic year.",
    tooltip:
      "Teachers who are active in the selected academic year roster (status=active).",
    href: (year) => `/list/teachers?status=active&year=${encodeURIComponent(year)}`,
  },
  student: {
    label: "Students",
    description:
      "Enrolled scholars with at least one class assignment this academic year.",
    tooltip:
      "Active students, excluding withdrawn records, for the selected year.",
    href: (year) => `/list/students?status=active&year=${encodeURIComponent(year)}`,
  },
  parent: {
    label: "Parents",
    description: "Guardians linked to active students in the directory year.",
    tooltip:
      "Active guardians with at least one linked student in the chosen academic year.",
    href: (year) => `/list/parents?status=active&year=${encodeURIComponent(year)}`,
  },
};

export type DashboardTile = {
  key: DashboardTileKey;
  label: string;
  count: number;
  description: string;
  tooltip: string;
  href: string;
  year: string;
  lastUpdated: string;
};

export type DashboardMetric = {
  id: string;
  title: string;
  value: number;
  delta: number;
  description: string;
  window: string;
  formula: string;
  source: string;
  link: string;
  lastUpdated: string;
};

const formatTimestamp = (date = new Date()) =>
  new Date(date).toISOString();

const getAttendanceRange = (reference = new Date(), days = 14, offset = 0) => {
  const end = new Date(reference);
  end.setHours(23, 59, 59, 999);
  end.setDate(end.getDate() - offset);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

const countAttendance = async (start: Date, end: Date, present?: boolean) =>
  prisma.attendance.count({
    where: {
      date: {
        gte: start,
        lte: end,
      },
      ...(typeof present === "boolean" ? { present } : {}),
    },
  });

export const getDashboardCounts = async (
  year = DEFAULT_DASHBOARD_YEAR
): Promise<{ tiles: DashboardTile[]; year: string }> => {
  const [adminCount, teacherCount, studentCount, parentCount] =
    await Promise.all([
      prisma.admin.count(),
      prisma.teacher.count(),
      prisma.student.count(),
      prisma.parent.count(),
    ]);

  const lastUpdated = formatTimestamp();

  const counts: Record<DashboardTileKey, number> = {
    admin: adminCount,
    teacher: teacherCount,
    student: studentCount,
    parent: parentCount,
  };

  const tiles: DashboardTile[] = (Object.keys(TILE_DEFINITIONS) as DashboardTileKey[]).map(
    (key) => ({
      key,
      label: TILE_DEFINITIONS[key].label,
      count: counts[key],
      description: TILE_DEFINITIONS[key].description,
      tooltip: TILE_DEFINITIONS[key].tooltip,
      href: TILE_DEFINITIONS[key].href(year),
      year,
      lastUpdated,
    })
  );

  return { tiles, year };
};

export const getDashboardMetrics = async (): Promise<DashboardMetric[]> => {
  const now = new Date();
  const lastUpdated = formatTimestamp(now);

  const lastRange = getAttendanceRange(now, 14, 0);
  const prevRange = getAttendanceRange(now, 14, 14);

  const [presentLast, totalLast, presentPrev, totalPrev] = await Promise.all([
    countAttendance(lastRange.start, lastRange.end, true),
    countAttendance(lastRange.start, lastRange.end),
    countAttendance(prevRange.start, prevRange.end, true),
    countAttendance(prevRange.start, prevRange.end),
  ]);

  const lastAttendanceRatio =
    totalLast === 0 ? 0 : Math.round((presentLast / totalLast) * 100);
  const prevAttendanceRatio =
    totalPrev === 0 ? lastAttendanceRatio : Math.round((presentPrev / totalPrev) * 100);

  const snapshots = await prisma.performanceSnapshot.findMany({
    orderBy: { updatedAt: "desc" },
    take: 2,
    select: {
      overallScore: true,
      assignmentsCompleted: true,
      assignmentsTotal: true,
      updatedAt: true,
    },
  });

  const latestSnapshot = snapshots[0];
  const previousSnapshot = snapshots[1];

  const engagementValue = latestSnapshot?.overallScore ?? 0;
  const engagementDelta = previousSnapshot
    ? Math.round((engagementValue || 0) - (previousSnapshot.overallScore || 0))
    : 0;

  const assignmentsCompleted = snapshots.reduce(
    (sum, snapshot) => sum + (snapshot.assignmentsCompleted ?? 0),
    0
  );
  const assignmentsTotal = snapshots.reduce(
    (sum, snapshot) => sum + (snapshot.assignmentsTotal ?? 0),
    0
  );
  const financeRatio =
    assignmentsTotal === 0
      ? 0
      : Math.round((assignmentsCompleted / assignmentsTotal) * 100);
  const financeDelta = 0;

  return [
    {
      id: "engagement",
      title: "Engagement",
      value: Math.min(100, Math.round(engagementValue)),
      delta: engagementDelta,
      description: "Average engagement score across tracked subject snapshots.",
      window: "Last 14 days",
      formula: "avg(performanceSnapshot.overallScore)",
      source: "performanceSnapshot.overallScore",
      link: "/list/results?window=14d",
      lastUpdated,
    },
    {
      id: "attendance",
      title: "Perfect attendance",
      value: lastAttendanceRatio,
      delta: Math.round(lastAttendanceRatio - prevAttendanceRatio),
      description: "Percentage of present attendance records in the rolling 14-day window.",
      window: "14-day rolling window",
      formula: "present / total · 100",
      source: "attendance.present flag",
      link: "/list/attendance?range=14d",
      lastUpdated,
    },
    {
      id: "completion",
      title: "Completion",
      value: financeRatio,
      delta: financeDelta,
      description:
        "Assignment completion vs target from the latest performance snapshots.",
      window: "Month-to-date",
      formula: "sum(assignmentsCompleted) / sum(assignmentsTotal) · 100",
      source: "performanceSnapshot.assignmentsCompleted / assignmentsTotal",
      link: "/list/assignments?window=month",
      lastUpdated,
    },
  ];
};
