import Image from "next/image";

import EventCalendar from "./EventCalendar";
import EventList from "./EventList";
import prisma from "@/lib/prisma";

const EventCalendarContainer = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const { date } = searchParams;
  const events = await prisma.event.findMany({
    orderBy: { startTime: "asc" },
  });
  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    startTime: event.startTime.toISOString(),
  }));

  return (
    <div className="bg-white p-4 rounded-md">
      <EventCalendar events={calendarEvents} selectedDate={date} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold my-4">Events</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <div className="flex flex-col gap-4">
        <EventList dateParam={date} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
