import { describe, it, expect, vi, beforeEach } from "vitest";

const { single } = vi.hoisted(() => ({ single: vi.fn() }));
vi.mock("./supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ single }) }),
    }),
  },
}));

import { getGlobalDark } from "./settings";

beforeEach(() => single.mockReset());

describe("getGlobalDark", () => {
  it("returns the row value", async () => {
    single.mockResolvedValue({ data: { dark_mode: true } });
    expect(await getGlobalDark()).toBe(true);
  });

  it("defaults to false when data is null", async () => {
    single.mockResolvedValue({ data: null });
    expect(await getGlobalDark()).toBe(false);
  });
});
