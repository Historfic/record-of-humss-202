import { describe, it, expect, vi, afterEach } from "vitest";
import { isOnline, onNetworkChange } from "./net";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("net", () => {
  it("isOnline reflects navigator.onLine", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    expect(isOnline()).toBe(false);
  });
  it("onNetworkChange subscribes and returns an unsubscribe", () => {
    const cb = vi.fn();
    const off = onNetworkChange(cb);
    window.dispatchEvent(new Event("online"));
    expect(cb).toHaveBeenCalledWith(true);
    window.dispatchEvent(new Event("offline"));
    expect(cb).toHaveBeenCalledWith(false);
    off();
    cb.mockClear();
    window.dispatchEvent(new Event("online"));
    expect(cb).not.toHaveBeenCalled();
  });
});
