import Image from "next/image";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import EmptyState from "@/components/ui/EmptyState";
import ListPageShell from "@/components/ui/ListPageShell";
import { DEV_USER_ID, getSessionRole } from "@/lib/devAuth";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Announcement, Class, Prisma } from "@prisma/client";

type AnnouncementList = Announcement & { class: Pick<Class, "id" | "name"> };

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

const AnnouncementListPage = async ({ searchParams }: PageProps) => {
  const userId = DEV_USER_ID;
  const role = getSessionRole();

  // Columns must match cells
  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Class", accessor: "class" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" as const }] : []),
  ];

  // Parse & sanitize pagination
  const rawPage = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const p = Math.max(1, Number.isFinite(Number(rawPage)) ? parseInt(String(rawPage), 10) : 1);

  // Build WHERE
  const query: Prisma.AnnouncementWhereInput = {};

  const search = Array.isArray(searchParams.search) ? searchParams.search[0] : searchParams.search;
  if (search) {
    query.title = { contains: search };
  }

  // Role-based visibility
  // Optional: add { schoolId: currentSchoolId } and/or { published: true } to tighten scope
  const roleConditions: Record<string, Prisma.ClassWhereInput> = {
    admin: {}, // admins see all (within tenant)
    teacher: { lessons: { some: { teacherId: userId } } },
    student: { students: { some: { id: userId } } },
    parent: { students: { some: { parentId: userId } } },
  };

  query.OR = [
    // Global announcements—consider gating with published/schoolId
    { classId: null /* , published: true */ },
    { class: roleConditions[role] ?? {} },
  ];

  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: { class: { select: { id: true, name: true } } },
      orderBy: { date: "desc" },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.announcement.count({ where: query }),
  ]);

  const renderRow = (item: AnnouncementList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-plPurpleLight">
      <td className="p-4">{item.title}</td>
      <td>{item.class?.name ?? "-"}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" /*, timeZone: "America/New_York"*/ }).format(item.date)}
      </td>
      {role === "admin" && (
        <td>
          <div className="flex items-center gap-2">
            <FormContainer table="announcement" type="update" data={item} />
            <FormContainer table="announcement" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  const toolbar = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <TableSearch placeholder="Search announcements..." />
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

  return (
    <ListPageShell
      title="Announcements"
      subtitle="Share timely updates with specific classes or the entire community."
      actions={
        role === "admin" && (
          <FormContainer table="announcement" type="create">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-semibold text-[#271b70] shadow-sm transition hover:opacity-90">
              <Image src="/create.png" alt="" width={14} height={14} />
              New announcement
            </span>
          </FormContainer>
        )
      }
      toolbar={toolbar}
    >
      <>
        {data.length ? (
          <Table columns={columns} renderRow={renderRow} data={data} />
        ) : (
          <EmptyState title="No announcements" description="Try adjusting your search or filters to see announcements." />
        )}
        <Pagination page={p} count={count} />
      </>
    </ListPageShell>
  );
};

export default AnnouncementListPage;
