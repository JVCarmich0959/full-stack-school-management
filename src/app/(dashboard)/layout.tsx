import Image from "next/image";
import Link from "next/link";

import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-[color:var(--color-text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-screen-2xl">
        {/* Sidebar */}
        <aside className="flex w-20 flex-col border-r border-[var(--color-border)] bg-[var(--color-sidebar-bg)] px-3 py-6 text-sm text-[color:var(--color-text-muted)] sm:w-48 lg:w-64">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-full bg-[var(--color-surface)] px-3 py-2 text-sm font-semibold text-[color:var(--color-text-primary)] shadow-sm transition hover:opacity-90 lg:justify-start"
          >
            <Image src="/logo.png" alt="logo" width={28} height={28} />
            <span className="hidden lg:block">ScholarLinq</span>
          </Link>
          <Menu />
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col bg-[var(--color-page-bg)]">
          <Navbar />
          <main className="flex-1 overflow-y-auto px-4 pb-10 pt-4 sm:px-6 lg:px-10">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
