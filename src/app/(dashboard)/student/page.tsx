import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";

import prisma from "@/lib/prisma";
import { DEV_USER_ID, getSessionRole } from "@/lib/devAuth";

const StudentPage = async () => {
  const role = getSessionRole();
  const userId = DEV_USER_ID;

  let classes = await prisma.class.findMany({
    where: role === "student" ? { students: { some: { id: userId } } } : {},
  });

  if (!classes.length) {
    classes = await prisma.class.findMany();
  }

  const activeClass = classes[0];

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* Left Sidebar */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">
            Schedule {activeClass ? `(${activeClass.name})` : ""}
          </h1>
          {activeClass ? (
            <BigCalendarContainer type="classId" id={activeClass.id} />
          ) : (
            <p className="text-sm text-gray-500">No classes available.</p>
          )}
        </div>
      </div>
      {/* Right Sidebar */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default StudentPage;
