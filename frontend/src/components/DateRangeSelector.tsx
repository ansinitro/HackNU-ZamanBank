import { useState } from "react";
import { Calendar } from "lucide-react";

const ZamanColors = {
    PersianGreen: '#2D9A86',
    Solar: '#EEFE6D',
    Cloud: '#FFFFFF',
    LightTeal: '#B8E6DC',
    DarkTeal: '#1A5F52',
};

export function TransactionsDateFilter({
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
  loading,
  onFilterChange,
}: {
  dateFrom: string;
  dateTo: string;
  setDateFrom: (val: string) => void;
  setDateTo: (val: string) => void;
  loading: boolean;
  onFilterChange?: () => void;
}) {
  const [preset, setPreset] = useState("");

  const handlePresetChange = (value: string) => {
    setPreset(value);

    const today = new Date();
    let startDate: Date;

    switch (value) {
      case "last_week":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case "last_month":
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "last_3_months":
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 3);
        break;
      case "last_6_months":
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 6);
        break;
      case "last_year":
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        return;
    }

    const format = (d: Date) => d.toISOString().split("T")[0];
    setDateFrom(format(startDate));
    setDateTo(format(today));

    onFilterChange?.(); // trigger auto refresh if provided
  };

  return (
    <div>
      <label
        className="block text-xs sm:text-sm font-semibold mb-2"
        style={{ color: ZamanColors.PersianGreen }}
      >
        <div className="flex items-center gap-2">
          <Calendar size={14} className="sm:w-4 sm:h-4" />
          Date Range
        </div>
      </label>

      {/* Preset selector */}
      <select
        value={preset}
        onChange={(e) => handlePresetChange(e.target.value)}
        disabled={loading}
        className="w-full mb-2 px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl outline-none text-xs sm:text-sm transition-all duration-300 disabled:opacity-50"
        style={{
          backgroundColor: ZamanColors.Cloud,
          border: `2px solid ${ZamanColors.PersianGreen}20`,
          color: ZamanColors.PersianGreen,
        }}
      >
        <option value="">Custom Range</option>
        <option value="last_week">Last Week</option>
        <option value="last_month">Last Month</option>
        <option value="last_3_months">Last 3 Months</option>
        <option value="last_6_months">Last 6 Months</option>
        <option value="last_year">Last Year</option>
      </select>

      {/* Manual date inputs */}
      <div className="flex gap-2">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setPreset("");
            setDateFrom(e.target.value);
            onFilterChange?.();
          }}
          max={dateTo || undefined}
          disabled={loading}
          className="flex-1 px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl outline-none transition-all duration-300 text-xs sm:text-sm disabled:opacity-50"
          style={{
            backgroundColor: ZamanColors.Cloud,
            border: `2px solid ${
              dateFrom ? ZamanColors.Solar : `${ZamanColors.PersianGreen}20`
            }`,
            color: ZamanColors.PersianGreen,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = ZamanColors.Solar;
            e.target.style.boxShadow = `0 0 0 3px ${ZamanColors.Solar}20`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = dateFrom
              ? ZamanColors.Solar
              : `${ZamanColors.PersianGreen}20`;
            e.target.style.boxShadow = "none";
          }}
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setPreset("");
            setDateTo(e.target.value);
            onFilterChange?.();
          }}
          min={dateFrom || undefined}
          disabled={loading}
          className="flex-1 px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl outline-none transition-all duration-300 text-xs sm:text-sm disabled:opacity-50"
          style={{
            backgroundColor: ZamanColors.Cloud,
            border: `2px solid ${
              dateTo ? ZamanColors.Solar : `${ZamanColors.PersianGreen}20`
            }`,
            color: ZamanColors.PersianGreen,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = ZamanColors.Solar;
            e.target.style.boxShadow = `0 0 0 3px ${ZamanColors.Solar}20`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = dateTo
              ? ZamanColors.Solar
              : `${ZamanColors.PersianGreen}20`;
            e.target.style.boxShadow = "none";
          }}
        />
      </div>
    </div>
  );
}
