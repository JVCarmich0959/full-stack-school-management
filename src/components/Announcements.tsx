import prisma from "@/lib/prisma";
import { DEV_USER_ID, getSessionRole } from "@/lib/devAuth";

const Announcements = async () => {
  const role = getSessionRole();
  const userId = DEV_USER_ID;

  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId } } },
    student: { students: { some: { id: userId } } },
    parent: { students: { some: { parentId: userId } } },
  };

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const data = await prisma.announcement.findMany({
    take: 12,
    orderBy: { date: "asc" },
    where: {
      date: { gte: startOfMonth },
      ...(!["admin", "guest"].includes(role) && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
    },
  });

  const groupedAnnouncements = data.reduce(
    (acc: Record<string, typeof data>, announcement) => {
      const monthLabel = announcement.date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!acc[monthLabel]) {
        acc[monthLabel] = [];
      }
      acc[monthLabel].push(announcement);
      return acc;
    },
    {}
  );

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <span className="text-xs text-gray-400">View All</span>
      </div>
      <div className="flex flex-col gap-5 mt-4">
        {Object.entries(groupedAnnouncements).length === 0 && (
          <p className="text-sm text-gray-500">No upcoming announcements.</p>
        )}
        {Object.entries(groupedAnnouncements).map(
          ([monthLabel, announcements]) => (
            <div key={monthLabel} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {monthLabel}
              </h3>
              {announcements.map((announcement, index) => (
                <div
                  key={announcement.id}
                  className={`rounded-md p-4 ${
                    index % 3 === 0
                      ? "bg-plSkyLight"
                      : index % 3 === 1
                      ? "bg-plPurpleLight"
                      : "bg-plYellowLight"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-medium">{announcement.title}</h2>
                    <span className="text-xs text-gray-500 bg-white rounded-md px-2 py-1">
                      {new Intl.DateTimeFormat("en-GB").format(
                        announcement.date
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {announcement.description}
                  </p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Announcements;
