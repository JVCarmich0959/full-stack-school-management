import Image from "next/image";

import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import EmptyState from "@/components/ui/EmptyState";
import ListPageShell from "@/components/ui/ListPageShell";

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
    query.lesson!.subject = { name: { contains: search } };
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
      orderBy: [{ dueDate: "desc" }, { id: "desc" }], // stable pagination
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.assignment.count({ where: query }),
  ]);

  const toolbar = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <TableSearch placeholder="Search assignments..." />
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

  const canEdit = role === "admin" || role === "teacher";

  return (
    <ListPageShell
      title="Assignments"
      subtitle="Monitor every deliverable, due date, and responsible teacher."
      actions={
        canEdit && (
          <FormModal table="assignment" type="create">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-semibold text-[#271b70] shadow-sm transition hover:opacity-90">
              <Image src="/create.png" alt="" width={14} height={14} />
              New assignment
            </span>
          </FormModal>
        )
      }
      toolbar={toolbar}
    >
      <>
        {data.length ? (
          <Table columns={columns} renderRow={renderRow} data={data} />
        ) : (
          <EmptyState title="No assignments" description="Try adjusting your search or filters to see results." />
        )}
        <Pagination page={p} count={count} />
      </>
    </ListPageShell>
  );
};

export default AssignmentListPage;
