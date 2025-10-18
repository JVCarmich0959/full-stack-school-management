import Image from "next/image";

import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import { DEV_USER_ID, getSessionRole } from "@/lib/devAuth";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";

import { Assignment, Class, Prisma, Subject, Teacher } from "@prisma/client";

type AssignmentList = Assignment & {
  lesson: {
    subject: Pick<Subject, "name">;
    class: Pick<Class, "name">;
    teacher: Pick<Teacher, "name" | "surname">;
  };
};

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

const AssignmentListPage = async ({ searchParams }: PageProps) => {
  const role = getSessionRole();
  const userId = DEV_USER_ID;

  const columns = [
    { header: "Subject Name", accessor: "name" },
    { header: "Class", accessor: "class" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Due Date", accessor: "dueDate", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "teacher" ? [{ header: "Actions", accessor: "action" as const }] : []),
  ];

  const renderRow = (item: AssignmentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-plPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.lesson.subject.name}</td>
      <td>{item.lesson.class.name}</td>
      <td className="hidden md:table-cell">
        {`${item.lesson.teacher.name} ${item.lesson.teacher.surname}`}
      </td>
      <td className="hidden md:table-cell">
        {item.dueDate
          ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(item.dueDate)
          : "—"}
      </td>
      {(role === "admin" || role === "teacher") && (
        <td>
          <div className="flex items-center gap-2">
            <FormModal table="assignment" type="update" data={item} />
            <FormModal table="assignment" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  // Pagination parsing (safe)
  const rawPage = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const p = Math.max(1, Number.isFinite(Number(rawPage)) ? parseInt(String(rawPage), 10) : 1);

  // WHERE
  const query: Prisma.AssignmentWhereInput = { lesson: {} };

  // Filters
  const qp = searchParams;
  const classId = Array.isArray(qp.classId) ? qp.classId[0] : qp.classId;
  const teacherId = Array.isArray(qp.teacherId) ? qp.teacherId[0] : qp.teacherId;
  const search = Array.isArray(qp.search) ? qp.search[0] : qp.search;

  if (classId) {
    const cid = parseInt(classId, 10);
    if (Number.isFinite(cid)) query.lesson!.classId = cid;
  }
  if (teacherId) query.lesson!.teacherId = teacherId;
  if (search) {
    query.lesson!.subject = { name: { contains: search, mode: "insensitive" } };
  }

  // Role scoping
  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.lesson!.teacherId = userId;
      break;
    case "student":
      query.lesson!.class = { students: { some: { id: userId } } };
      break;
    case "parent":
      query.lesson!.class = { students: { some: { parentId: userId } } };
      break;
  }

  const [data, count] = await prisma.$transaction([
    prisma.assignment.findMany({
      where: query,
      include: {
        lesson: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true, surname: true } },
            class: { select: { name: true } },
          },
        },
      },
      orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }], // stable pagination
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.assignment.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Assignments</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-plYellow" aria-label="Filter">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-plYellow" aria-label="Sort">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormModal table="assignment" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* LIST */}
      {data.length ? (
        <Table columns={columns} renderRow={renderRow} data={data} />
      ) : (
        <div className="text-sm text-gray-500 p-8 text-center">No assignments match your filters.</div>
      )}

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AssignmentListPage;
