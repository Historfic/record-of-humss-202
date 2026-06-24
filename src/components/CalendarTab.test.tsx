import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

const { listNotes, addNote, deleteNote } = vi.hoisted(() => ({
  listNotes: vi.fn().mockResolvedValue([
    { id: "1", title: "Math project", description: "Chapter 5", due_date: "2026-07-01" },
  ]),
  addNote: vi.fn().mockResolvedValue(undefined),
  deleteNote: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../lib/calendar", async (orig) => {
  const actual = await orig<typeof import("../lib/calendar")>();
  return { ...actual, listNotes, addNote, deleteNote };
});
import { CalendarTab } from "./CalendarTab";

describe("CalendarTab", () => {
  it("lists existing notes", async () => {
    render(<CalendarTab />);
    await waitFor(() => expect(screen.getByText("Math project")).toBeInTheDocument());
  });
  it("adds a note", async () => {
    render(<CalendarTab />);
    await waitFor(() => expect(screen.getByText("Math project")).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText(/project \/ assignment/i), { target: { value: "Science HW" } });
    fireEvent.change(screen.getByTestId("note-due"), { target: { value: "2026-06-30" } });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
    await waitFor(() =>
      expect(addNote).toHaveBeenCalledWith(expect.objectContaining({ title: "Science HW", due_date: "2026-06-30" }))
    );
  });
});
