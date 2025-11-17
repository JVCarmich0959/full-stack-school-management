"use client";

import { useEffect, useMemo, useState } from "react";
import Calendar, { TileArgs } from "react-calendar";
import { useRouter } from "next/navigation";

import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type CalendarEvent = {
  id: number;
  title: string;
  startTime: string;
};

const EventCalendar = ({
  events,
  selectedDate,
}: {
  events: CalendarEvent[];
  selectedDate?: string;
}) => {
  const normalizedSelectedDate = useMemo(
    () => (selectedDate ? new Date(selectedDate).toISOString() : null),
    [selectedDate]
  );
  const [value, onChange] = useState<Value>(
    normalizedSelectedDate ? new Date(normalizedSelectedDate) : new Date()
  );
  const router = useRouter();

  useEffect(() => {
    if (normalizedSelectedDate) {
      onChange(new Date(normalizedSelectedDate));
    }
  }, [normalizedSelectedDate]);

  useEffect(() => {
    if (value instanceof Date) {
      const iso = value.toISOString();
      if (normalizedSelectedDate === iso) return;
      router.push(`?date=${encodeURIComponent(iso)}`);
    }
  }, [value, router, normalizedSelectedDate]);

  const highlightedDates = useMemo(() => {
    const map = new Map<string, string[]>();
    events.forEach((event) => {
      const key = new Date(event.startTime).toDateString();
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(event.title);
    });
    return map;
  }, [events]);

  const tileContent = ({ date, view }: TileArgs) => {
    if (view !== "month") return null;
    const titles = highlightedDates.get(date.toDateString());
    if (!titles) return null;

    return (
      <div className="mt-1 flex justify-center">
        <span
          className="inline-block w-2 h-2 rounded-full bg-plPurple"
          title={titles.join(", ")}
        />
      </div>
    );
  };

  return (
    <Calendar
      onChange={onChange}
      value={value}
      tileContent={tileContent}
      className="event-calendar"
    />
  );
};

export default EventCalendar;
