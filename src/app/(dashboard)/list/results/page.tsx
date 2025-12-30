import Image from "next/image";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import ListPageShell from "@/components/ui/ListPageShell";

import { DEV_USER_ID, getSessionRole } from "@/lib/devAuth";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";

import { Prisma } from "@prisma/client";

type ResultList = {
  id: number;
  title: string;
  studentName: string;
  studentSurname: string;
  teacherName: string;
  teacherSurname: string;
  score: number;
  className: string;
  startTime: Date;
};


const ResultListPage = async ({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) => {

const role = getSessionRole();
const currentUserId = DEV_USER_ID;


const columns = [
  {
    header: "Title",
    accessor: "title",
  },
  {
    header: "Student",
    accessor: "student",
  },
  {
    header: "Score",
    accessor: "score",
    className: "hidden md:table-cell",
  },
  {
    header: "Teacher",
    accessor: "teacher",
    className: "hidden md:table-cell",
  },
  {
    header: "Class",
    accessor: "class",
    className: "hidden md:table-cell",
  },
  {
    header: "Date",
    accessor: "date",
    className: "hidden md:table-cell",
  },
  ...(role === "admin" || role === "teacher"
    ? [
        {
          header: "Actions",
          accessor: "action",
        },
      ]
    : []),
];

const renderRow = (item: ResultList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-plPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">{item.title}</td>
    <td>{item.studentName + " " + item.studentSurname}</td>
    <td className="hidden md:table-cell">{item.score}</td>
    <td className="hidden md:table-cell">
      {item.teacherName + " " + item.teacherSurname}
    </td>
    <td className="hidden md:table-cell">{item.className}</td>
    <td className="hidden md:table-cell">
      {new Intl.DateTimeFormat("en-US").format(item.startTime)}
    </td>
    <td>
      <div className="flex items-center gap-2">
        {(role === "admin" || role === "teacher") && (
          <>
            <FormContainer table="result" type="update" data={item} />
            <FormContainer table="result" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(Array.isArray(page) ? page[0] : page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.ResultWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          case "search":
            query.OR = [
              { exam: { title: { contains: value } } },
              { student: { name: { contains: value } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS

  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.OR = [
        { exam: { lesson: { teacherId: currentUserId } } },
        { assignment: { lesson: { teacherId: currentUserId } } },
      ];
      break;

    case "student":
      query.studentId = currentUserId;
      break;

    case "parent":
      query.student = {
        parentId: currentUserId,
      };
      break;
    default:
      break;
  }

  const [dataRes, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.result.count({ where: query }),
  ]);

  const data = dataRes.map((item) => {
    const assessment = item.exam || item.assignment;

    if (!assessment) return null;

    const isExam = "startTime" in assessment;

    return {
      id: item.id,
      title: assessment.title,
      studentName: item.student.name,
      studentSurname: item.student.surname,
      teacherName: assessment.lesson.teacher.name,
      teacherSurname: assessment.lesson.teacher.surname,
      score: item.score,
      className: assessment.lesson.class.name,
      startTime: isExam ? assessment.startTime : assessment.startDate,
    };
  });

  const toolbar = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <TableSearch placeholder="Search results..." />
      <div className="flex items-center gap-2 text-xs">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-2 font-medium text-[color:var(--color-text-primary)] transition hover:border-[var(--color-accent-secondary)]"
        >
          <Image src="/filter.png" alt="" width={14} height={14} />
          Filters
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-2 font-medium text-[color:var(--color-text-primary)] transition hover:border-[var(--color-accent-secondary)]"
        >
          <Image src="/sort.png" alt="" width={14} height={14} />
          Sort
        </button>
      </div>
    </div>
  );

  const canManage = role === "admin" || role === "teacher";

  return (
    <ListPageShell
      title="Assessment results"
      subtitle="View scholar performance across exams and assignments."
      actions={
        canManage && (
          <FormContainer table="result" type="create">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-semibold text-[#271b70] shadow-sm transition hover:opacity-90">
              <Image src="/create.png" alt="" width={14} height={14} />
              New result
            </span>
          </FormContainer>
        )
      }
      toolbar={toolbar}
    >
      <>
        <Table columns={columns} renderRow={renderRow} data={data} />
        <Pagination page={p} count={count} />
      </>
    </ListPageShell>
  );
};

export default ResultListPage;
