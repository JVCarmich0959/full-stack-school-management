"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

type TableSearchProps = {
  placeholder?: string;
  paramName?: string;
};

const TableSearch = ({
  placeholder = "Search records...",
  paramName = "search",
}: TableSearchProps) => {
  const router = useRouter();

  const buildUrlWithPatch = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    const nextSearch = params.toString();
    return `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = (e.currentTarget[0] as HTMLInputElement).value.trim();
    router.push(
      buildUrlWithPatch({ [paramName]: value || undefined, page: "1" })
    );
  };
  const defaultValue =
    new URLSearchParams(window.location.search).get(paramName) ?? "";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs text-[color:var(--color-text-muted)] md:w-auto"
    >
      <Image
        src="/search.png"
        alt=""
        width={14}
        height={14}
        className="opacity-80"
      />
      <input
        type="text"
        placeholder={placeholder}
        aria-label="Search directory"
        name={paramName}
        defaultValue={defaultValue}
        className="w-[200px] bg-transparent text-[color:var(--color-text-primary)] outline-none placeholder:text-[color:var(--color-text-muted)]"
      />
    </form>
  );
};

export default TableSearch;
