import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { DEV_USER_ID } from "@/lib/devAuth";

const TeacherPage = () => {
  const userId = DEV_USER_ID;
  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* Left Sidebar */}
      <div className="w-full xl:w-2/3">
          <div className="h-full bg-white p-4 rounded-md">
            <h1 className="text-xl font-semibold">Schedule</h1>
            <BigCalendarContainer type="teacherId" id={userId} />
        </div>
      </div>
      {/* Right Sidebar */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default TeacherPage;
