"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const notificationQueue = [
  {
    id: "bus",
    title: "Transport update",
    message: "Bus route 4 is delayed by 10 minutes due to traffic.",
    category: "Logistics",
    severity: "Warning",
    cta: { label: "Notify families", href: "/list/events?category=transport" },
  },
  {
    id: "finance",
    title: "Finance",
    message: "New fee payment received for the Grade 10 cohort.",
    category: "Operations",
    severity: "Info",
    cta: { label: "View payment", href: "/list/assignments?window=month" },
  },
  {
    id: "lesson",
    title: "Curriculum",
    message: "Ms. Patel published the Algebra II practice set for Friday.",
    category: "Academics",
    severity: "Info",
    cta: { label: "View lesson", href: "/list/assignments" },
  },
  {
    id: "event",
    title: "Event",
    message: "Career Day speakers have confirmed their attendance.",
    category: "Community",
    severity: "Info",
    cta: { label: "View event", href: "/list/events?window=month" },
  },
  {
    id: "attendance",
    title: "Attendance",
    message: "Attendance for Grade K just crossed 98% for the week.",
    category: "Wellbeing",
    severity: "Critical",
    cta: { label: "View attendance", href: "/list/attendance?range=7d" },
  },
];

type Notification = {
  id: string;
  fingerprint: string;
  title: string;
  message: string;
  category: string;
  timestamp: number;
  unread?: boolean;
  severity: "Info" | "Warning" | "Critical";
  cta?: { label: string; href: string };
  count: number;
};

const STORAGE_KEY = "dashboard.notifications.read";
const DEDUPE_WINDOW_MS = 90 * 1000;

const severityStyles: Record<string, string> = {
  Info: "bg-blue-50 text-blue-700",
  Warning: "bg-yellow-50 text-yellow-700",
  Critical: "bg-red-50 text-red-700",
};

const useLiveNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [readFingerprints, setReadFingerprints] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const payload = window.localStorage.getItem(STORAGE_KEY);
      return payload ? JSON.parse(payload) : [];
    } catch {
      return [];
    }
  });
  const readRef = useRef(new Set(readFingerprints));

  useEffect(() => {
    readRef.current = new Set(readFingerprints);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(readFingerprints));
    }
  }, [readFingerprints]);

  useEffect(() => {
    let index = 0;

    const pushNotification = () => {
      setNotifications((prev) => {
        const next = notificationQueue[index % notificationQueue.length];
        const now = Date.now();
        const fingerprint = `${next.id}-${next.message}`;
        const existingIndex = prev.findIndex(
          (item) =>
            item.fingerprint === fingerprint &&
            now - item.timestamp <= DEDUPE_WINDOW_MS
        );

        if (existingIndex >= 0) {
          return prev.map((item, idx) =>
            idx === existingIndex
              ? {
                  ...item,
                  timestamp: now,
                  unread: true,
                  count: item.count + 1,
                }
              : item
          );
        }

        const entry: Notification = {
          ...next,
          fingerprint,
          id: `${fingerprint}-${now}`,
          timestamp: now,
          unread: !readRef.current.has(fingerprint),
          count: 1,
        };

        return [entry, ...prev].slice(0, 10);
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
    setReadFingerprints((prev) => {
      const combined = [...prev, ...notifications.map((item) => item.fingerprint)];
      return Array.from(new Set(combined));
    });
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

      <div
        className="space-y-3 max-h-[420px] overflow-auto pr-1"
        role="feed"
        aria-live="polite"
      >
        {notifications.map((item) => (
          <article
            key={item.id}
            className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 bg-gray-50 min-w-0"
            role="article"
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
                  {formatTime(new Date(item.timestamp))}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{item.message}</p>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden />
                  Streaming
                </span>
                {item.unread && (
                  <span className="text-primary font-medium">Unread</span>
                )}
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${severityStyles[item.severity]}`}
                >
                  {item.severity}
                </span>
              </div>
              {item.count > 1 && (
                <p className="text-[11px] text-gray-500 mt-1">
                  +{item.count - 1} similar event{item.count > 2 ? "s" : ""}
                </p>
              )}
              {item.cta && (
                <Link
                  href={item.cta.href}
                  className="mt-2 inline-flex items-center rounded-full border border-[color:var(--color-accent-secondary)] px-3 py-1 text-[11px] font-semibold text-[color:var(--color-accent-secondary)] transition hover:bg-[var(--color-accent-secondary)] hover:text-white"
                >
                  {item.cta.label}
                </Link>
              )}
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
