// Date helpers. "Today" uses the machine's local time zone, not UTC,
// so an expense added late in the evening lands on the right day.

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function today() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function currentMonth() {
  return today().slice(0, 7);
}

export function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { startDate: `${month}-01`, endDate: `${month}-${pad(lastDay)}` };
}

export interface Period {
  startDate: string | null;
  endDate: string | null;
  label: string;
}

// Resolve a month or date range into concrete dates (defaults to this month)
export function resolvePeriod(input: {
  month?: string;
  startDate?: string;
  endDate?: string;
}): Period {
  if (input.month && (input.startDate || input.endDate)) {
    throw new Error("Use either month or startDate/endDate, not both.");
  }
  if (input.startDate || input.endDate) {
    if (input.startDate && input.endDate && input.startDate > input.endDate) {
      throw new Error("startDate must be on or before endDate.");
    }
    return {
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      label: `${input.startDate ?? "the beginning"} to ${input.endDate ?? "today"}`,
    };
  }
  const month = input.month ?? currentMonth();
  return { ...monthRange(month), label: month };
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
