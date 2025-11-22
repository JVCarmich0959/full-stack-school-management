"use client";

import { useTheme } from "./ThemeProvider";

const sunIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="size-4"
    aria-hidden="true"
  >
    <path d="M12 4.5c.414 0 .75-.336.75-.75V1.5a.75.75 0 0 0-1.5 0v2.25c0 .414.336.75.75.75Zm0 15c-.414 0-.75.335-.75.75V22.5a.75.75 0 1 0 1.5 0V20.25a.75.75 0 0 0-.75-.75Zm9-6a.75.75 0 0 0 0-1.5h-2.25a.75.75 0 1 0 0 1.5H21Zm-15 0a.75.75 0 0 0 0-1.5H3a.75.75 0 1 0 0 1.5h3Zm11.304-7.804a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.06 1.06l1.59 1.591Zm-11.124 11.125a.75.75 0 0 0-1.06 1.06l1.59 1.591a.75.75 0 1 0 1.06-1.06l-1.59-1.591Zm11.124 1.061a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.06 1.06l1.59 1.591ZM7.179 6.696a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.06 1.06l1.59 1.591Zm4.821 9.054a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
  </svg>
);

const moonIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="size-4"
    aria-hidden="true"
  >
    <path d="M20.354 15.354a9 9 0 1 1-11.708-11.708 9.003 9.003 0 0 0 11.708 11.708Z" />
  </svg>
);

export default function ThemeToggle() {
  const { theme, toggleTheme, isReady } = useTheme();
  const label =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      disabled={!isReady}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-muted)] transition hover:text-[color:var(--color-text-primary)] disabled:opacity-60"
    >
      <span className="flex items-center text-[color:var(--color-text-primary)]">
        {theme === "dark" ? sunIcon : moonIcon}
      </span>
      <span className="hidden sm:inline">
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </span>
    </button>
  );
}
