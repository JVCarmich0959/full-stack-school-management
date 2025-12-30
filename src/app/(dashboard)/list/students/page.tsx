import Image from "next/image";
import Link from "next/link";

import FormContainer from "@/components/FormContainer";
import ListPageShell from "@/components/ui/ListPageShell";
import Pagination from "@/components/Pagination";
import StudentFilters from "@/components/StudentFilters";
import StudentSort from "@/components/StudentSort";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getSessionRole } from "@/lib/devAuth";
import { formatGradeLabel } from "@/lib/studentDirectoryConfig";
import type { StudentWithClass } from "@/server/repositories/studentRepository";
import {
  getStudentDirectory,
  parseDirectoryQuery,
} from "@/server/services/studentService";

const normalizeValue = (value?: string | null, fallback = "Not provided") => {
  const cleaned = value?.trim();
  if (!cleaned || cleaned.toLowerCase() === "unknown") {
    return fallback;
  }
  return cleaned;
};

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) => {
  const role = getSessionRole();
  const directoryQuery = parseDirectoryQuery(searchParams);

  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Student ID",
      accessor: "studentId",
      className: "hidden md:table-cell",
    },
    {
      header: "Grade",
      accessor: "grade",
      className: "hidden md:table-cell",
    },
    {
      header: "Subjects",
      accessor: "subjects",
      className: "hidden lg:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const directory = await getStudentDirectory(directoryQuery);
  const data = directory.students;
  const total = directory.pagination.total;
  const start =
    total === 0
      ? 0
      : (directory.pagination.page - 1) * directory.pagination.pageSize + 1;
  const end =
    total === 0
      ? 0
      : Math.min(
          directory.pagination.page * directory.pagination.pageSize,
          total
        );
  const summaryText =
    total === 0 ? "Showing 0 of 0" : `Showing ${start}–${end} of ${total}`;

  const toolbar = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-4">
          <TableSearch placeholder="Search students..." paramName="q" />
          <StudentFilters
            grade={directoryQuery.grade}
            missingSubjects={directoryQuery.missingSubjects}
            missingClasses={directoryQuery.missingClasses}
            multiGrade={directoryQuery.multiGrade}
          />
        </div>
        <StudentSort
          sort={directoryQuery.sort}
          pageSize={directoryQuery.pageSize}
        />
      </div>
    </div>
  );

  const renderRow = (item: StudentWithClass) => {
    const gradeLevel = item.grade?.level ?? item.class?.grade?.level;
    const gradeLabel = formatGradeLabel(gradeLevel);
    const subjectNames =
      item.class?.lessons
        ?.map((lesson) => lesson.subject?.name)
        .filter(Boolean) ?? [];
    const uniqueSubjects = Array.from(new Set(subjectNames));
    const subjectsLabel =
      uniqueSubjects.length > 0 ? uniqueSubjects.join(", ") : "Not assigned";

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-plPurpleLight"
      >
        <td className="flex items-center gap-4 p-4">
          <Image
            src={item.img || "/noAvatar.png"}
            alt=""
            width={40}
            height={40}
            className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-xs text-gray-500">{item.class?.name}</p>
          </div>
        </td>
        <td className="hidden md:table-cell">{item.username}</td>
        <td className="hidden md:table-cell">{gradeLabel}</td>
        <td className="hidden lg:table-cell">{subjectsLabel}</td>
        <td className="hidden lg:table-cell">
          {normalizeValue(item.phone, "Not provided")}
        </td>
        <td className="hidden lg:table-cell">
          {normalizeValue(item.address, "Not provided")}
        </td>
        <td>
          <div className="flex items-center gap-2">
            <Link href={`/list/students/${item.id}`}>
              <button
                className="w-7 h-7 flex items-center justify-center rounded-full bg-plSky"
                aria-label={`View ${item.name ?? "student"} profile`}
                title="View student profile"
              >
                <Image src="/view.png" alt="" width={16} height={16} />
              </button>
            </Link>
            {role === "admin" && (
              <FormContainer table="student" type="delete" id={item.id} />
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <ListPageShell
      title="Student roster"
      subtitle="Manage scholar records, linked guardians, and class assignments."
      actions={
        role === "admin" && (
          <FormContainer table="student" type="create">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-semibold text-[#271b70] shadow-sm transition hover:opacity-90">
              <Image src="/create.png" alt="" width={14} height={14} />
              New student
            </span>
          </FormContainer>
        )
      }
      toolbar={toolbar}
      summary={
        <p className="text-xs text-[color:var(--color-text-muted)]">
          {summaryText}
        </p>
      }
    >
      <>
        <Table columns={columns} renderRow={renderRow} data={data} />
        <Pagination
          page={directory.pagination.page}
          count={total}
          pageSize={directory.pagination.pageSize}
        />
      </>
    </ListPageShell>
  );
};

export default StudentListPage;
