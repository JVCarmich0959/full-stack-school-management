"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

type TableSearchProps = {
  placeholder?: string;
};

const TableSearch = ({ placeholder = "Search records..." }: TableSearchProps) => {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = (e.currentTarget[0] as HTMLInputElement).value;

    const params = new URLSearchParams(window.location.search);
    params.set("search", value);
    router.push(`${window.location.pathname}?${params}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs text-[color:var(--color-text-muted)] md:w-auto"
    >
      <Image src="/search.png" alt="" width={14} height={14} className="opacity-80" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-[200px] bg-transparent text-[color:var(--color-text-primary)] outline-none placeholder:text-[color:var(--color-text-muted)]"
      />
    </form>
  );
};

export default TableSearch;
