"use client";

import { useEffect, useMemo, useState } from "react";

const notificationQueue = [
  {
    id: "bus",
    title: "Transport update",
    message: "Bus route 4 is delayed by 10 minutes due to traffic.",
    category: "Logistics",
  },
  {
    id: "finance",
    title: "Finance",
    message: "New fee payment received for the Grade 10 cohort.",
    category: "Operations",
  },
  {
    id: "lesson",
    title: "Curriculum",
    message: "Ms. Patel published the Algebra II practice set for Friday.",
    category: "Academics",
  },
  {
    id: "event",
    title: "Event",
    message: "Career Day speakers have confirmed their attendance.",
    category: "Community",
  },
  {
    id: "attendance",
    title: "Attendance",
    message: "Attendance for Grade 8 just crossed 98% for the week.",
    category: "Wellbeing",
  },
];

type Notification = {
  id: string;
  title: string;
  message: string;
  category: string;
  timestamp: Date;
  unread?: boolean;
};

const useLiveNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let index = 0;

    const pushNotification = () => {
      setNotifications((prev) => {
        const next = notificationQueue[index % notificationQueue.length];

        return [
          {
            ...next,
            id: `${next.id}-${Date.now()}`,
            timestamp: new Date(),
            unread: true,
          },
          ...prev,
        ].slice(0, 10);
      });
      index += 1;
    };

    const interval = setInterval(() => {
      if (!isPaused) {
        pushNotification();
      }
    }, 4200);

    // seed the first notification immediately for instant feedback
    pushNotification();

    return () => clearInterval(interval);
  }, [isPaused]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  return { notifications, isPaused, setIsPaused, markAllAsRead };
};

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

const NotificationsFeed = () => {
  const { notifications, isPaused, setIsPaused, markAllAsRead } =
    useLiveNotifications();

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  );

  return (
    <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden />
          <div>
            <p className="text-sm text-gray-500 leading-none">Live</p>
            <h2 className="font-semibold leading-tight">Real-time notifications</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="text-xs bg-primary text-white rounded-full px-2 py-1">
              {unreadCount} new
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            className="text-xs border px-3 py-1 rounded-full hover:bg-gray-50 transition"
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-xs underline text-gray-600 hover:text-gray-800"
          >
            Mark all read
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1" role="feed">
        {notifications.map((item) => (
          <article
            key={item.id}
            className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 bg-gray-50"
            role="article"
            aria-live="polite"
          >
            <div
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white text-xs font-semibold"
              aria-label={item.category}
            >
              {item.category.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatTime(item.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{item.message}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden />
                  Streaming
                </span>
                {item.unread && <span className="text-primary font-medium">Unread</span>}
              </div>
            </div>
          </article>
        ))}
        {notifications.length === 0 && (
          <p className="text-sm text-gray-500">Waiting for new activity...</p>
        )}
      </div>
    </section>
  );
};

export default NotificationsFeed;
