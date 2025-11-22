import Image from "next/image";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import ParentFilters from "@/components/ParentFilters";
import { getSessionRole } from "@/lib/devAuth";
import { ITEM_PER_PAGE } from "@/lib/settings";
import type { ParentWithStudents } from "@/server/repositories/parentRepository";
import { getParentDirectory } from "@/server/services/parentService";
import type { GuardianFilter } from "@/server/types/filters";

const ParentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const role = getSessionRole();

  const columns = [
    { header: "Family", accessor: "info" },
    { header: "Scholars", accessor: "students", className: "hidden md:table-cell" },
    { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
    { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: ParentWithStudents) => {
    const guardianNames = Array.from(
      new Set(
        item.students
          .map((student) => student.guardianName?.trim())
          .filter((value): value is string => Boolean(value))
      )
    );

    const guardianPhones = Array.from(
      new Set(
        item.students
          .map((student) => student.guardianPhone?.trim())
          .filter((value): value is string => Boolean(value))
      )
    );

    const guardianEmails = Array.from(
      new Set(
        item.students
          .map((student) => student.guardianEmail?.trim())
          .filter((value): value is string => Boolean(value))
      )
    );

    const fullName =
      guardianNames.join(", ") ||
      [item.name, item.surname].filter(Boolean).join(" ").trim() ||
      "Unknown Parent";

    const emailLabel = item.email?.trim() || guardianEmails.join(", ") || "No email";
    const phoneLabel = item.phone?.trim() || guardianPhones.join(", ") || "Unknown";
    const addressLabel = item.address?.trim() ? item.address : "Unknown";

    return (
      <tr key={item.id} className="group text-sm">
        <td className="rounded-l-3xl bg-[var(--color-surface)] px-4 py-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-[color:var(--color-text-primary)]">
              {fullName}
            </h3>
            <p className="text-xs text-[color:var(--color-text-muted)]">{emailLabel}</p>
            <p className="text-[11px] text-[color:var(--color-text-muted)]">
              {guardianNames.length > 0 ? "Primary contact" : "Profile"}
            </p>
          </div>
        </td>
        <td className="hidden rounded-none bg-[var(--color-surface)] px-4 py-4 text-sm shadow-sm md:table-cell">
          <div className="flex flex-wrap gap-1 text-xs font-medium text-[color:var(--color-text-primary)]">
            {item.students.map((student) => (
              <span
                key={student.id}
                className="rounded-full bg-[var(--color-page-bg)] px-3 py-1 text-[11px]"
              >
                {(student.firstName ?? student.name) || "Student"} {student.lastName ?? ""}
              </span>
            ))}
          </div>
        </td>
        <td className="hidden bg-[var(--color-surface)] px-4 py-4 text-sm shadow-sm lg:table-cell">
          <div className="flex flex-col gap-1">
            <span className="font-medium">{phoneLabel}</span>
            {guardianPhones.length > 1 && (
              <span className="text-xs text-[color:var(--color-text-muted)]">
                + {guardianPhones.length - 1} more numbers
              </span>
            )}
          </div>
        </td>
        <td className="hidden bg-[var(--color-surface)] px-4 py-4 text-sm shadow-sm lg:table-cell">
          {addressLabel}
        </td>
        {role === "admin" && (
          <td className="rounded-r-3xl bg-[var(--color-surface)] px-4 py-4 shadow-sm">
            <div className="flex items-center gap-2">
              <FormContainer table="parent" type="update" data={item} />
              <FormContainer table="parent" type="delete" id={item.id} />
            </div>
          </td>
        )}
      </tr>
    );
  };

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page, 10) : 1;
  const searchValue = queryParams.search?.trim();
  const gradeFilter = queryParams.grade ? parseInt(queryParams.grade, 10) : undefined;
  const homeroomFilter = queryParams.homeroom?.trim();
  const guardianFilterParam = queryParams.guardian?.trim();
  const guardianFilter: GuardianFilter | undefined =
    guardianFilterParam === "complete" || guardianFilterParam === "missing"
      ? guardianFilterParam
      : undefined;

  const directory = await getParentDirectory({
    page: p,
    pageSize: ITEM_PER_PAGE,
    search: searchValue,
    grade: Number.isFinite(gradeFilter) ? gradeFilter : undefined,
    homeroom: homeroomFilter,
    guardian: guardianFilter,
  });

  const data = directory.parents;
  const count = directory.pagination.total;
  const studentsWithContacts = directory.metrics.studentsWithContacts;
  const studentsMissingContacts = directory.metrics.studentsMissingContacts;
  const coverageRate = directory.metrics.coverageRate;
  const gradeOptions = directory.filterOptions.grades;
  const homeroomOptions = directory.filterOptions.homerooms;
  const dataQuality = directory.dataQuality;
  const totalStudentsTracked =
    studentsWithContacts + studentsMissingContacts;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Family directory"
        subtitle="Centralize guardian details, students, and quick actions for every household."
        actions={
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 font-semibold text-[color:var(--color-text-primary)] transition hover:border-[var(--color-accent-primary)]"
            >
              <Image src="/upload.png" alt="" width={14} height={14} />
              Export CSV
            </button>
            {role === "admin" && (
              <FormContainer table="parent" type="create">
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-semibold text-[#271b70] shadow-sm transition hover:opacity-90">
                  <Image src="/create.png" alt="" width={14} height={14} />
                  New guardian
                </span>
              </FormContainer>
            )}
          </div>
        }
      />

      <Card>
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
              Active households
            </dt>
            <dd className="text-3xl font-semibold text-[color:var(--color-text-primary)]">
              {count}
            </dd>
            <p className="text-xs text-[color:var(--color-text-muted)]">
              Families captured in the system
            </p>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
              Students covered
            </dt>
            <dd className="text-3xl font-semibold text-[color:var(--color-text-primary)]">
              {studentsWithContacts}
            </dd>
            <p className="text-xs text-[color:var(--color-text-muted)]">
              Linked to at least one guardian email
            </p>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
              Contact coverage
            </dt>
            <dd className="text-3xl font-semibold text-[color:var(--color-text-primary)]">
              {coverageRate}%
            </dd>
            <p className="text-xs text-[color:var(--color-text-muted)]">
              Based on {totalStudentsTracked || "0"} total students
            </p>
          </div>
        </dl>
      </Card>
      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
            Data quality alerts
          </p>
          <p className="text-base font-semibold text-[color:var(--color-text-primary)]">
            Guardian contact hygiene
          </p>
        </div>
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
              Missing guardian emails
            </p>
            <p className="text-2xl font-semibold text-[color:var(--color-text-primary)]">
              {dataQuality.missingEmails}
            </p>
            <p className="text-xs text-[color:var(--color-text-muted)]">
              Encourage families to provide an email for digital access
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
              Missing guardian phones
            </p>
            <p className="text-2xl font-semibold text-[color:var(--color-text-primary)]">
              {dataQuality.missingPhones}
            </p>
            <p className="text-xs text-[color:var(--color-text-muted)]">
              Capture at least one reachable number per household
            </p>
          </div>
        </div>
        {dataQuality.missingEmails === 0 && dataQuality.missingPhones === 0 && (
          <p className="text-xs text-[color:var(--color-text-muted)]">
            All guardians on file have both email and phone contact details. 🎉
          </p>
        )}
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TableSearch placeholder="Search families..." />
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
        <ParentFilters
          grades={gradeOptions}
          homerooms={homeroomOptions}
          selectedGrade={gradeFilter}
          selectedHomeroom={homeroomFilter}
          selectedGuardian={guardianFilter}
        />

        {data.length === 0 ? (
          <EmptyState
            title="No guardians found"
            description="Try adjusting your search or add a new guardian profile."
            action={
              role === "admin" ? (
                <FormContainer table="parent" type="create">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-4 py-2 text-xs font-semibold text-[#271b70]">
                    <Image src="/create.png" alt="" width={12} height={12} />
                    Add guardian
                  </span>
                </FormContainer>
              ) : null
            }
          />
        ) : (
          <>
            <Table columns={columns} renderRow={renderRow} data={data} />
            <Pagination page={p} count={count} />
          </>
        )}
      </Card>
    </div>
  );
};

export default ParentListPage;
