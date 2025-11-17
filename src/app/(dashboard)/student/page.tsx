import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";

import prisma from "@/lib/prisma";
import { DEV_USER_ID, getSessionRole } from "@/lib/devAuth";

const StudentPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const role = getSessionRole();
  const userId = DEV_USER_ID;
  const normalizedSearchParams = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ])
  ) as { [key: string]: string | undefined };

  let classes = await prisma.class.findMany({
    where: role === "student" ? { students: { some: { id: userId } } } : {},
  });

  if (!classes.length) {
    classes = await prisma.class.findMany();
  }

  const activeClass = classes[0];

  const baseStudentQuery = {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      esparkUsername: true,
      esparkPassword: true,
    },
    orderBy: { firstName: "asc" as const },
  };

  let students = await prisma.student.findMany({
    ...baseStudentQuery,
    where: role === "student" ? { id: userId } : {},
  });

  if (!students.length && activeClass) {
    students = await prisma.student.findMany({
      ...baseStudentQuery,
      where: { classId: activeClass.id },
    });
  }

  if (!students.length) {
    students = await prisma.student.findMany({
      ...baseStudentQuery,
      take: 10,
    });
  }

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* Left Column */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">
            Schedule {activeClass ? `(${activeClass.name})` : ""}
          </h1>
          {activeClass ? (
            <BigCalendarContainer type="classId" id={activeClass.id} />
          ) : (
            <p className="text-sm text-gray-500">No classes available.</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-md">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-semibold">eSpark Credentials</h2>
            <span className="text-xs text-gray-500">
              Username &amp; password for quick lookup
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {students.length ? (
              students.map((student) => (
                <div
                  key={student.id}
                  className="border border-gray-100 rounded-md p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                >
                  <div>
                    <p className="font-medium text-gray-700">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-gray-400">
                      eSpark credentials
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 flex flex-col gap-1">
                    <span>
                      <span className="font-semibold">Username: </span>
                      {student.esparkUsername || "—"}
                    </span>
                    <span>
                      <span className="font-semibold">Password: </span>
                      {student.esparkPassword || "—"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No students found for this view.
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Right Column */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer searchParams={normalizedSearchParams} />
        <Announcements />
      </div>
    </div>
  );
};

export default StudentPage;
