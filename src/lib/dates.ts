function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

// ISO dates (YYYY-MM-DD) of the Mon-Fri school days in a month.
// monthIndex is 0-based (0 = January), matching JS Date.
export function weekdaysOfMonth(year: number, monthIndex: number): string[] {
  const days: string[] = [];
  const d = new Date(Date.UTC(year, monthIndex, 1));
  while (d.getUTCMonth() === monthIndex) {
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) {
      days.push(`${d.getUTCFullYear()}-${pad2(monthIndex + 1)}-${pad2(d.getUTCDate())}`);
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return days;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthLabel(year: number, monthIndex: number): string {
  return `${MONTHS[monthIndex]} ${year}`;
}

// Adds `delta` months to a {year, monthIndex}, rolling over the year.
export function shiftMonth(
  year: number,
  monthIndex: number,
  delta: number
): { year: number; monthIndex: number } {
  const total = year * 12 + monthIndex + delta;
  return { year: Math.floor(total / 12), monthIndex: ((total % 12) + 12) % 12 };
}
