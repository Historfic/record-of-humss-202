import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const { isOnline, onNetworkChange, flushOutbox, count } = vi.hoisted(() => {
  let handler: ((o: boolean) => void) | null = null;
  return {
    isOnline: vi.fn(),
    onNetworkChange: vi.fn((cb: (o: boolean) => void) => { handler = cb; return () => {}; }),
    flushOutbox: vi.fn().mockResolvedValue(1),
    count: vi.fn(),
    __emit: (o: boolean) => handler && handler(o),
  } as any;
});
vi.mock("../lib/net", () => ({ isOnline, onNetworkChange }));
vi.mock("../lib/db", () => ({ flushOutbox }));
vi.mock("../lib/outbox", () => ({ count }));
import { OfflineBanner } from "./OfflineBanner";

beforeEach(() => { isOnline.mockReturnValue(true); count.mockReturnValue(0); });

describe("OfflineBanner", () => {
  it("renders nothing when online with nothing pending", () => {
    render(<OfflineBanner />);
    expect(screen.queryByTestId("offline-banner")).toBeNull();
  });
  it("shows an offline bar with the pending count when offline", () => {
    isOnline.mockReturnValue(false);
    count.mockReturnValue(2);
    render(<OfflineBanner />);
    expect(screen.getByTestId("offline-banner")).toHaveTextContent(/2/);
  });
});
