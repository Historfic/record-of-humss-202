import { useTheme } from "../context/ThemeContext";

export function DarkModeToggle({ className = "" }: { className?: string }) {
  const { effective, togglePersonal } = useTheme();
  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={togglePersonal}
      className={[
        "flex h-9 w-9 items-center justify-center rounded-full text-lg transition",
        "hover:bg-violet-100 dark:hover:bg-slate-700",
        className,
      ].join(" ")}
    >
      {effective ? "☀️" : "🌙"}
    </button>
  );
}
