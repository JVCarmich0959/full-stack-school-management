import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode, Suspense } from "react";

import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import StudentProfileLayout from "@/components/student/StudentProfileLayout";
import PerformanceDashboard from "@/components/student/PerformanceDashboard";
import ClassroomMetrics from "@/components/student/ClassroomMetrics";
import DashboardErrorBoundary from "@/components/student/DashboardErrorBoundary";
import MetricCard from "@/components/student/MetricCard";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";

import prisma from "@/lib/prisma";
import { getSessionRole } from "@/lib/devAuth";
import { Class, Student } from "@prisma/client";

const Metric = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2">
    <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
      {label}
    </p>
    <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
      {value}
    </p>
  </div>
);

const FallbackCard = ({ message }: { message: string }) => (
  <div className="rounded-3xl border border-dashed border-[var(--color-border)] px-4 py-6 text-sm text-[color:var(--color-text-muted)]">
    {message}
  </div>
);

const SingleStudentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const role = getSessionRole();

  const student:
    | (Student & {
        class: Class & { _count: { lessons: number } };
      })
    | null = await prisma.student.findUnique({
    where: { id },
    include: {
      class: { include: { _count: { select: { lessons: true } } } },
    },
  });

  if (!student) {
    return notFound();
  }

  const header = (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex items-center gap-4">
          <Image
            src={student.img || "/noAvatar.png"}
            alt=""
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">
                {student.name} {student.surname}
              </h1>
              {role === "admin" && (
                <FormContainer table="student" type="update" data={student} />
              )}
            </div>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              Homeroom {student.class.name} • Clever ID {student.cleverId}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Metric label="Blood type" value={student.bloodType || "—"} />
          <Metric
            label="Birthday"
            value={new Intl.DateTimeFormat("en-GB").format(student.birthday)}
          />
          <Metric label="Email" value={student.email || "—"} />
          <Metric label="Phone" value={student.phone || "—"} />
        </div>
      </div>
    </div>
  );

  const primarySection = (
    <>
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <Suspense fallback="loading...">
            <StudentAttendanceCard id={student.id} />
          </Suspense>
        </div>
        <div className="flex w-full flex-1 flex-wrap gap-3 text-sm">
          <MetricCard label="Grade" value={`${student.class.name.charAt(0)}th`} />
          <MetricCard label="Lessons" value={`${student.class._count.lessons}`} />
          <MetricCard label="Classroom" value={student.class.name} />
        </div>
      </div>
      <DashboardErrorBoundary fallback={<FallbackCard message="Performance dashboard unavailable." />}>
        <PerformanceDashboard studentId={student.id} />
      </DashboardErrorBoundary>
    </>
  );

  const shortcutLinks = [
    {
      label: "Student's Lessons",
      href: `/list/lessons?classId=${student.class.id}`,
      tone: "bg-plSkyLight",
    },
    {
      label: "Student's Teachers",
      href: `/list/teachers?classId=${student.class.id}`,
      tone: "bg-plPurpleLight",
    },
    {
      label: "Student's Exams",
      href: `/list/exams?classId=${student.class.id}`,
      tone: "bg-pink-50",
    },
    {
      label: "Student's Assignments",
      href: `/list/assignments?classId=${student.class.id}`,
      tone: "bg-plSkyLight",
    },
    {
      label: "Student's Results",
      href: `/list/results?studentId=${student.id}`,
      tone: "bg-plYellowLight",
    },
  ];

  const sidebarSection = (
    <>
      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Shortcuts</h2>
          <span className="text-xs text-[color:var(--color-text-muted)]">Quick nav</span>
        </header>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-[color:var(--color-text-muted)]">
          {shortcutLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`px-3 py-1.5 rounded-md font-medium text-[color:var(--color-text-primary)] ${link.tone}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <h2 className="text-xl font-semibold">Digital Access</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-2xl bg-[var(--color-surface-muted)] px-3 py-2">
            <span className="font-medium">eSpark Username</span>
            <span>{student.esparkUsername || "—"}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-[var(--color-surface-muted)] px-3 py-2">
            <span className="font-medium">eSpark Password</span>
            <span>{student.esparkPassword || "—"}</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold text-[color:var(--color-text-muted)]">
            Quick links
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <Link className="rounded-full border border-[var(--color-border)] px-3 py-1.5" href={`/list/lessons?classId=${student.class.id}`}>
              Lessons
            </Link>
            <Link className="rounded-full border border-[var(--color-border)] px-3 py-1.5" href={`/list/teachers?classId=${student.class.id}`}>
              Teachers
            </Link>
            <Link className="rounded-full border border-[var(--color-border)] px-3 py-1.5" href={`/list/exams?classId=${student.class.id}`}>
              Exams
            </Link>
            <Link className="rounded-full border border-[var(--color-border)] px-3 py-1.5" href={`/list/assignments?classId=${student.class.id}`}>
              Assignments
            </Link>
            <Link className="rounded-full border border-[var(--color-border)] px-3 py-1.5" href={`/list/results?studentId=${student.id}`}>
              Results
            </Link>
          </div>
        </div>
      </div>
      <DashboardErrorBoundary fallback={<FallbackCard message="Classroom metrics unavailable." />}>
        <ClassroomMetrics studentId={student.id} />
      </DashboardErrorBoundary>
      <Announcements />
    </>
  );

  const scheduleSection = (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <h2 className="text-xl font-semibold">Student Schedule</h2>
      <BigCalendarContainer type="classId" id={student.class.id} />
    </div>
  );

  return (
    <StudentProfileLayout
      header={header}
      primary={primarySection}
      sidebar={sidebarSection}
      schedule={scheduleSection}
    />
  );
};

export default SingleStudentPage;
