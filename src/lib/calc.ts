// Safe small-expression evaluator supporting + - * / with decimals and precedence.
// Implemented as a recursive-descent parser over a tokenized input. Never uses eval/Function.

type Token =
  | { type: "num"; value: number }
  | { type: "op"; value: "+" | "-" | "*" | "/" };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (ch === " ") {
      i++;
      continue;
    }
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/") {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }
    if ((ch >= "0" && ch <= "9") || ch === ".") {
      let num = "";
      while (
        i < input.length &&
        ((input[i] >= "0" && input[i] <= "9") || input[i] === ".")
      ) {
        num += input[i];
        i++;
      }
      if (num === "." || (num.match(/\./g) || []).length > 1) {
        throw new Error("bad number");
      }
      tokens.push({ type: "num", value: Number(num) });
      continue;
    }
    throw new Error("bad char");
  }
  return tokens;
}

class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  parse(): number {
    const value = this.parseExpr();
    if (this.pos !== this.tokens.length) throw new Error("trailing tokens");
    return value;
  }

  // expr := term (('+' | '-') term)*
  private parseExpr(): number {
    let value = this.parseTerm();
    let t = this.peek();
    while (t && t.type === "op" && (t.value === "+" || t.value === "-")) {
      this.pos++;
      const rhs = this.parseTerm();
      value = t.value === "+" ? value + rhs : value - rhs;
      t = this.peek();
    }
    return value;
  }

  // term := factor (('*' | '/') factor)*
  private parseTerm(): number {
    let value = this.parseFactor();
    let t = this.peek();
    while (t && t.type === "op" && (t.value === "*" || t.value === "/")) {
      this.pos++;
      const rhs = this.parseFactor();
      value = t.value === "*" ? value * rhs : value / rhs;
      t = this.peek();
    }
    return value;
  }

  // factor := number | ('+' | '-') factor
  private parseFactor(): number {
    const t = this.peek();
    if (!t) throw new Error("unexpected end");
    if (t.type === "op" && (t.value === "+" || t.value === "-")) {
      this.pos++;
      const operand = this.parseFactor();
      return t.value === "-" ? -operand : operand;
    }
    if (t.type === "num") {
      this.pos++;
      return t.value;
    }
    throw new Error("unexpected token");
  }
}

export function evaluate(expr: string): string {
  if (!expr || expr.trim() === "") return "";
  try {
    const tokens = tokenize(expr);
    if (tokens.length === 0) return "";
    const result = new Parser(tokens).parse();
    if (!Number.isFinite(result)) return "Error";
    // Round to max 6 decimals to avoid float noise like 0.1 + 0.2, then String().
    const rounded = Math.round(result * 1e6) / 1e6;
    return String(rounded);
  } catch {
    return "Error";
  }
}
