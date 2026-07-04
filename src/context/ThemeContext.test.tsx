import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { getGlobalDark, setGlobalDark } = vi.hoisted(() => ({
  getGlobalDark: vi.fn(),
  setGlobalDark: vi.fn(),
}));
vi.mock("../lib/settings", () => ({ getGlobalDark, setGlobalDark }));

import { ThemeProvider, useTheme } from "./ThemeContext";

function Probe() {
  const { effective, togglePersonal } = useTheme();
  return (
    <button onClick={togglePersonal}>effective:{String(effective)}</button>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  getGlobalDark.mockResolvedValue(false);
  setGlobalDark.mockResolvedValue(undefined);
});

describe("ThemeContext", () => {
  it("toggling personal adds the dark class", () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    fireEvent.click(screen.getByRole("button"));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme-dark")).toBe("1");
  });

  it("adds the dark class when global loads true", async () => {
    getGlobalDark.mockResolvedValue(true);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(true),
    );
  });
});
