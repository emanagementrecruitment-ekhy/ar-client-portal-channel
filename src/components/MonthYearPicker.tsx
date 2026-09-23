"use client";

import { FULL_MONTHS } from "@/lib/format";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

/** "YYYY-MM" <-> a pair of Bulan/Tahun <select> dropdowns, so the picker works
 * consistently across browsers instead of relying on the native <input type="month">
 * (which renders very differently on desktop vs mobile). */
export default function MonthYearPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [yearStr, monthStr] = value.split("-");
  const year = Number(yearStr) || CURRENT_YEAR;
  const month = Number(monthStr) || 1;

  function setMonth(newMonth: number) {
    onChange(`${year}-${String(newMonth).padStart(2, "0")}`);
  }
  function setYear(newYear: number) {
    onChange(`${newYear}-${String(month).padStart(2, "0")}`);
  }

  return (
    <div className="flex gap-2">
      <select
        value={month}
        onChange={(e) => setMonth(Number(e.target.value))}
        className="py-2.5 px-3 bg-black/30 border border-[var(--line)] rounded-[10px] text-[12.5px] text-[var(--text)]"
      >
        {FULL_MONTHS.map((label, i) => (
          <option key={label} value={i + 1}>
            {label}
          </option>
        ))}
      </select>
      <select
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className="py-2.5 px-3 bg-black/30 border border-[var(--line)] rounded-[10px] text-[12.5px] text-[var(--text)]"
      >
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
