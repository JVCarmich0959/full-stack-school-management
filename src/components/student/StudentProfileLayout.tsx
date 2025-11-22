import type { ReactNode } from "react";

type StudentProfileLayoutProps = {
  header: ReactNode;
  primary: ReactNode;
  sidebar: ReactNode;
  schedule: ReactNode;
};

const StudentProfileLayout = ({
  header,
  primary,
  sidebar,
  schedule,
}: StudentProfileLayoutProps) => {
  return (
    <div className="flex-1 space-y-4 p-4">
      {header}
      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="w-full space-y-4 xl:w-2/3">
          {primary}
          {schedule}
        </div>
        <div className="w-full space-y-4 xl:w-1/3">{sidebar}</div>
      </div>
    </div>
  );
};

export default StudentProfileLayout;
