import Image from "next/image";

import ThemeToggle from "@/components/theme/ThemeToggle";
import { getSessionRole } from "@/lib/devAuth";

const Navbar = () => {
  const role = getSessionRole();
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 text-sm sm:px-6 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label
          htmlFor="dashboard-search"
          className="flex flex-1 items-center gap-3 rounded-full bg-[var(--color-surface-muted)] px-3 py-2 text-xs text-[color:var(--color-text-muted)] focus-within:ring-2 focus-within:ring-[var(--color-accent-secondary)]"
        >
          <Image src="/search.png" alt="" width={16} height={16} className="opacity-80" />
          <input
            id="dashboard-search"
            type="search"
            placeholder="Search students, parents, teachers..."
            className="w-full bg-transparent text-[color:var(--color-text-primary)] outline-none placeholder:text-[color:var(--color-text-muted)]"
          />
        </label>

        <div className="flex flex-1 items-center justify-end gap-3 text-xs">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative flex size-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-page-bg)] text-[color:var(--color-text-primary)] transition hover:border-[var(--color-accent-secondary)]"
              aria-label="Open messages"
            >
              <Image src="/message.png" alt="" width={18} height={18} />
            </button>
            <button
              type="button"
              className="relative flex size-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-page-bg)] text-[color:var(--color-text-primary)] transition hover:border-[var(--color-accent-secondary)]"
              aria-label="View announcements"
            >
              <Image src="/announcement.png" alt="" width={18} height={18} />
              <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full bg-[var(--color-accent-primary)] px-1 text-[10px] font-semibold text-[#271b70]">
                1
              </span>
            </button>
          </div>
          <div className="rounded-2xl bg-[var(--color-surface-muted)] px-3 py-1 text-right text-[11px] leading-tight">
            <p className="font-medium text-[color:var(--color-text-primary)]">John Doe</p>
            <p className="uppercase tracking-wide text-[color:var(--color-text-muted)]">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
