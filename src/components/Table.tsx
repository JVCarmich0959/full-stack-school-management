const Table = ({
  columns,
  renderRow,
  data,
}: {
  columns: { header: string; accessor: string; className?: string }[];
  renderRow: (item: any) => React.ReactNode;
  data: any[];
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="mt-4 w-full border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
            {columns.map((col) => (
              <th key={col.accessor} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[color:var(--color-text-primary)]">
          {data.map((item) => renderRow(item))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
