import { useState } from "react";
import { evaluate } from "../lib/calc";

interface CalculatorProps {
  open: boolean;
  onClose: () => void;
}

// Display symbols mapped to the characters appended to the expression.
const OPERATORS: { label: string; expr: string }[] = [
  { label: "+", expr: "+" },
  { label: "−", expr: "-" }, // U+2212 minus sign
  { label: "×", expr: "*" }, // multiplication sign
  { label: "÷", expr: "/" }, // division sign
];

export function Calculator({ open, onClose }: CalculatorProps) {
  const [expr, setExpr] = useState("");
  const [showingResult, setShowingResult] = useState(false);

  if (!open) return null;

  const append = (s: string) => {
    // If the display is showing a result or an error, start fresh on next input.
    if (showingResult || expr === "Error") {
      setExpr(s);
      setShowingResult(false);
      return;
    }
    setExpr((prev) => prev + s);
  };

  const clear = () => {
    setExpr("");
    setShowingResult(false);
  };

  const backspace = () => {
    if (showingResult || expr === "Error") {
      clear();
      return;
    }
    setExpr((prev) => prev.slice(0, -1));
  };

  const equals = () => {
    setExpr(evaluate(expr));
    setShowingResult(true);
  };

  const btn = "p-4 text-lg rounded bg-gray-100 active:bg-gray-300";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl p-4 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">Calculator</span>
          <button
            type="button"
            aria-label="Close calculator"
            onClick={onClose}
            className="p-2 text-xl leading-none text-gray-500"
          >
            {"×"}
          </button>
        </div>

        <div
          data-testid="calc-display"
          className="mb-3 min-h-[3rem] rounded bg-gray-50 px-3 py-2 text-right text-2xl font-mono break-all"
        >
          {expr || "0"}
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button type="button" className={btn} onClick={clear}>
            C
          </button>
          <button type="button" className={btn} onClick={backspace} aria-label="Backspace">
            {"⌫"}
          </button>
          {OPERATORS.slice(3).map((op) => (
            <button
              type="button"
              key={op.expr}
              className={btn}
              onClick={() => append(op.expr)}
            >
              {op.label}
            </button>
          ))}
          <button type="button" className={btn} onClick={() => append(OPERATORS[2].expr)}>
            {OPERATORS[2].label}
          </button>

          {["7", "8", "9"].map((d) => (
            <button type="button" key={d} className={btn} onClick={() => append(d)}>
              {d}
            </button>
          ))}
          <button type="button" className={btn} onClick={() => append(OPERATORS[1].expr)}>
            {OPERATORS[1].label}
          </button>

          {["4", "5", "6"].map((d) => (
            <button type="button" key={d} className={btn} onClick={() => append(d)}>
              {d}
            </button>
          ))}
          <button type="button" className={btn} onClick={() => append(OPERATORS[0].expr)}>
            {OPERATORS[0].label}
          </button>

          {["1", "2", "3"].map((d) => (
            <button type="button" key={d} className={btn} onClick={() => append(d)}>
              {d}
            </button>
          ))}
          <button
            type="button"
            className={`${btn} row-span-2 bg-blue-500 text-white active:bg-blue-700`}
            onClick={equals}
          >
            =
          </button>

          <button
            type="button"
            className={`${btn} col-span-2`}
            onClick={() => append("0")}
          >
            0
          </button>
          <button type="button" className={btn} onClick={() => append(".")}>
            .
          </button>
        </div>
      </div>
    </div>
  );
}
