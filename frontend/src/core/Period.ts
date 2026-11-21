export type Period = "month" | "6m" | "12m" | "18m" | "24m" | "year" | "all";

export const periodOptions: { value: Period; label: string }[] = [
  { value: "month", label: "Este mês" },
  { value: "6m", label: "Últimos 6 meses" },
  { value: "12m", label: "Últimos 12 meses" },
  { value: "18m", label: "Últimos 18 meses" },
  { value: "24m", label: "Últimos 24 meses" },
  { value: "year", label: "Este ano" },
  { value: "all", label: "Todo o período" },
];

const rollingMonths: Partial<Record<Period, number>> = {
  "6m": 6,
  "12m": 12,
  "18m": 18,
  "24m": 24,
};

export type PeriodRange = { start: string; end: string };

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const getPeriodRange = (
  period: Period,
  dates: string[],
): PeriodRange => {
  const now = new Date();
  const current = monthKey(now);

  if (period === "month") return { start: current, end: current };

  if (period === "year") {
    return {
      start: `${now.getFullYear()}-01`,
      end: `${now.getFullYear()}-12`,
    };
  }

  if (period === "all") {
    const keys = dates.map((date) => date.slice(0, 7)).sort();
    const first = keys[0];
    const last = keys[keys.length - 1];
    return {
      start: first && first < current ? first : current,
      end: last && last > current ? last : current,
    };
  }

  const months = rollingMonths[period] ?? 6;
  return {
    start: monthKey(
      new Date(now.getFullYear(), now.getMonth() - (months - 1), 1),
    ),
    end: current,
  };
};

export const isInRange = (date: string, range: PeriodRange): boolean => {
  const key = date.slice(0, 7);
  return key >= range.start && key <= range.end;
};

export type PeriodBucket = {
  key: string;
  label: string;
};

export const buildBuckets = (range: PeriodRange): PeriodBucket[] => {
  const buckets: PeriodBucket[] = [];

  if (range.start === range.end) {
    const [year, month] = range.start.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      buckets.push({
        key: `${range.start}-${String(day).padStart(2, "0")}`,
        label: String(day),
      });
    }
    return buckets;
  }

  let [year, month] = range.start.split("-").map(Number);
  const [endYear, endMonth] = range.end.split("-").map(Number);
  while (year < endYear || (year === endYear && month <= endMonth)) {
    const monthLabel = new Date(year, month - 1, 1)
      .toLocaleDateString("pt-BR", { month: "short" })
      .replace(".", "");
    buckets.push({
      key: `${year}-${String(month).padStart(2, "0")}`,
      label: `${monthLabel}/${String(year).slice(-2)}`,
    });
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return buckets;
};
