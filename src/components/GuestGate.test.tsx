import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { logGuestVisit } = vi.hoisted(() => ({
  logGuestVisit: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../lib/guest", () => ({ logGuestVisit }));
import { GuestGate } from "./GuestGate";

describe("GuestGate", () => {
  it("logs the visit and reports the entered name", async () => {
    const onEnter = vi.fn();
    render(<GuestGate onEnter={onEnter} />);
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: "Juan" } });
    fireEvent.click(screen.getByRole("button", { name: /view report/i }));
    await waitFor(() => expect(logGuestVisit).toHaveBeenCalledWith("Juan"));
    expect(onEnter).toHaveBeenCalledWith("Juan");
  });
});
