import type { ReactNode } from "react";

import Card from "./Card";
import PageHeader from "./PageHeader";

type ListPageShellProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  toolbar?: ReactNode;
  summary?: ReactNode;
  children: ReactNode;
};

const ListPageShell = ({
  title,
  subtitle,
  actions,
  toolbar,
  summary,
  children,
}: ListPageShellProps) => {
  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      {summary}
      <Card className="space-y-4">
        {toolbar}
        {children}
      </Card>
    </div>
  );
};

export default ListPageShell;
