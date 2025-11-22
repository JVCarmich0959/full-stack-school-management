import Image from "next/image";
import Link from "next/link";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import ListPageShell from "@/components/ui/ListPageShell";

import { getSessionRole } from "@/lib/devAuth";
import { ITEM_PER_PAGE } from "@/lib/settings";
import type { TeacherWithRelations } from "@/server/repositories/teacherRepository";
import { getTeacherDirectory } from "@/server/services/teacherService";

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const role = getSessionRole();
  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Teacher ID",
      accessor: "teacherId",
      className: "hidden md:table-cell",
    },
    {
      header: "Subjects",
      accessor: "subjects",
      className: "hidden md:table-cell",
    },
    {
      header: "Classes",
      accessor: "classes",
      className: "hidden md:table-cell",
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

  const renderRow = (item: TeacherWithRelations) => (
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
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">
        {item.subjects.map((subject) => subject.name).join(",")}
      </td>
      <td className="hidden md:table-cell">
        {item.classes.map((classItem) => classItem.name).join(",")}
      </td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-plSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-plPurple">
            //   <Image src="/delete.png" alt="" width={16} height={16} />
            // </button>
            <FormContainer table="teacher" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page as string, 10) : 1;
  const searchValue = queryParams.search?.trim();
  const classId = queryParams.classId ? parseInt(queryParams.classId, 10) : undefined;

  const directory = await getTeacherDirectory({
    page: p,
    pageSize: ITEM_PER_PAGE,
    search: searchValue,
    classId: Number.isFinite(classId) ? classId : undefined,
  });

  const data = directory.teachers;
  const count = directory.pagination.total;

  const toolbar = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <TableSearch placeholder="Search teachers..." />
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
      title="Teacher directory"
      subtitle="View staff credentials, subject loads, and homeroom assignments."
      actions={
        role === "admin" && (
          <FormContainer table="teacher" type="create">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-semibold text-[#271b70] shadow-sm transition hover:opacity-90">
              <Image src="/create.png" alt="" width={14} height={14} />
              New teacher
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

export default TeacherListPage;
