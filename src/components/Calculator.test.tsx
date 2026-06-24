import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Calculator } from "./Calculator";

describe("Calculator", () => {
  it("computes change: 100 - 78 = 22", () => {
    render(<Calculator open onClose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "−" })); // minus sign U+2212
    fireEvent.click(screen.getByRole("button", { name: "7" }));
    fireEvent.click(screen.getByRole("button", { name: "8" }));
    fireEvent.click(screen.getByRole("button", { name: "=" }));
    expect(screen.getByTestId("calc-display")).toHaveTextContent("22");
  });

  it("does not render when closed", () => {
    render(<Calculator open={false} onClose={() => {}} />);
    expect(screen.queryByTestId("calc-display")).toBeNull();
  });
});
