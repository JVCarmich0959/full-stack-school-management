import Link from "next/link";

import type { DashboardTile as Tile } from "@/server/services/dashboardService";

const DashboardTile = ({ tile }: { tile: Tile }) => {
  const formattedTime = new Date(tile.lastUpdated).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Link
      href={tile.href}
      className="rounded-2xl bg-white border border-gray-100 p-4 flex-1 min-w-0 transition hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-secondary)]"
      title={tile.tooltip}
      aria-label={`${tile.label} tile: ${tile.tooltip}`}
    >
      <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
        <span>{tile.year}</span>
        <span className="text-xs text-gray-400">Updated {formattedTime}</span>
      </div>
      <h1 className="text-2xl font-semibold my-4 text-[color:var(--color-text-primary)]">
        {tile.count.toLocaleString()}
      </h1>
      <h2 className="capitalize text-sm font-medium text-gray-500">{tile.label}</h2>
      <p className="text-xs text-gray-400 mt-2">{tile.description}</p>
    </Link>
  );
};

export default DashboardTile;
