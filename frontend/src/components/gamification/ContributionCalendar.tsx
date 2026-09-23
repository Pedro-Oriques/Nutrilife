"use client";

import { useState } from "react";
import { CalendarDay } from "@/services/api";
import { useTheme } from "@/contexts/ThemeContext";

interface ContributionCalendarProps {
  days: CalendarDay[];
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function getColor(points: number, emptyColor: string): string {
  if (points === 0) return emptyColor;
  if (points <= 100) return "#86efac";
  if (points <= 300) return "#4ade80";
  if (points <= 600) return "#16a34a";
  return "#00674F";
}

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Mobile: last 30 days displayed as 3 rows of 10 columns
function MobileCalendar({ days, emptyColor, labelColor, isDark }: {
  days: CalendarDay[];
  emptyColor: string;
  labelColor: string | undefined;
  isDark: boolean;
}) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const pointsMap = new Map(days.map((d) => [d.date, d.points]));

  // Build last 30 days ending today
  const today = new Date();
  const last30: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    last30.push(d.toISOString().split("T")[0]);
  }

  // 3 rows × 10 columns
  const ROWS = 3;
  const COLS = 10;
  const CELL = 28;
  const GAP = 4;

  // Split into rows
  const rows: string[][] = [];
  for (let r = 0; r < ROWS; r++) {
    rows.push(last30.slice(r * COLS, (r + 1) * COLS));
  }

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-base font-semibold mb-3 text-center" style={{ color: isDark ? "#ffffff" : "#002017" }}>
        Últimos 30 dias
      </h2>
      <div className="flex flex-col w-full" style={{ gap: GAP }}>
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex w-full" style={{ gap: GAP }}>
            {row.map((date) => {
              const points = pointsMap.get(date) ?? 0;
              const inRange = true;
              const color = getColor(points, emptyColor);
              const formattedDate = formatDate(date);
              const tooltipText = points > 0
                ? `Ganhou ${points} pontos em ${formattedDate}`
                : `Sem pontos em ${formattedDate}`;

              // Show day number inside cell
              const dayNum = parseInt(date.split("-")[2], 10);

              return (
                <div
                  key={date}
                  className="flex-1 flex items-center justify-center rounded-lg relative"
                  style={{ height: CELL, backgroundColor: color, cursor: "default" }}
                  onMouseEnter={() => setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  onTouchStart={() => setHoveredDate(date)}
                  onTouchEnd={() => setHoveredDate(null)}
                >
                  <span className="text-[10px] font-semibold select-none" style={{ color: points > 0 ? "#fff" : (isDark ? "#666" : "#aaa") }}>
                    {dayNum}
                  </span>
                  {hoveredDate === date && (
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap pointer-events-none">
                      <div className="bg-[#002017] text-white text-[10px] rounded px-2 py-1 shadow-lg">
                        {tooltipText}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 text-[10px] justify-end w-full" style={{ color: labelColor ?? "#6b7280" }}>
        <span>Menos</span>
        {[emptyColor, "#86efac", "#4ade80", "#16a34a", "#00674F"].map((color) => (
          <div key={color} style={{ width: 12, height: 12, backgroundColor: color, borderRadius: 3 }} />
        ))}
        <span>Mais</span>
      </div>
    </div>
  );
}

// Desktop: full year contribution grid
function DesktopCalendar({ days, emptyColor, labelColor, isDark }: {
  days: CalendarDay[];
  emptyColor: string;
  labelColor: string | undefined;
  isDark: boolean;
}) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const pointsMap = new Map(days.map((d) => [d.date, d.points]));

  const firstDate = new Date(days[0].date + "T00:00:00");
  const startSunday = new Date(firstDate);
  startSunday.setDate(firstDate.getDate() - firstDate.getDay());

  const lastDate = new Date(days[days.length - 1].date + "T00:00:00");
  const endSaturday = new Date(lastDate);
  endSaturday.setDate(lastDate.getDate() + (6 - lastDate.getDay()));

  const columns: Array<Array<{ date: string; inRange: boolean }>> = [];
  const cursor = new Date(startSunday);

  while (cursor <= endSaturday) {
    const week: Array<{ date: string; inRange: boolean }> = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = cursor.toISOString().split("T")[0];
      week.push({ date: dateStr, inRange: pointsMap.has(dateStr) || (cursor >= firstDate && cursor <= lastDate) });
      cursor.setDate(cursor.getDate() + 1);
    }
    columns.push(week);
  }

  const monthPositions: Array<{ col: number; label: string }> = [];
  columns.forEach((week, colIdx) => {
    week.forEach(({ date }) => {
      const d = new Date(date + "T00:00:00");
      if (d.getDate() === 1) {
        monthPositions.push({ col: colIdx, label: MONTH_LABELS[d.getMonth()] });
      }
    });
  });

  const CELL = 12;
  const GAP = 3;
  const STEP = CELL + GAP;
  const DAY_LABEL_W = 28;
  const gridWidth = columns.length * STEP - GAP;

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-base font-semibold mb-4 text-center" style={{ color: isDark ? "#ffffff" : "#002017" }}>
        Atividade no último ano
      </h2>
      <div className="overflow-x-auto w-full flex justify-center">
        <div style={{ position: "relative", paddingTop: 24 }}>
          <div style={{ marginLeft: DAY_LABEL_W, height: 18, position: "relative", width: gridWidth }}>
            {monthPositions.map(({ col, label }) => (
              <span key={`${col}-${label}`} className="text-[10px] absolute" style={{ left: col * STEP, color: labelColor ?? "#6b7280" }}>
                {label}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            <div style={{ width: DAY_LABEL_W, display: "flex", flexDirection: "column", gap: GAP }}>
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <div key={d} style={{ height: CELL, lineHeight: `${CELL}px`, fontSize: 9, color: labelColor ?? "#9ca3af" }} className="text-right pr-1 select-none">
                  {d % 2 === 1 ? DAY_LABELS[d] : ""}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: GAP }}>
              {columns.map((week, colIdx) => (
                <div key={colIdx} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                  {week.map(({ date, inRange }, rowIdx) => {
                    const points = pointsMap.get(date) ?? 0;
                    const color = inRange ? getColor(points, emptyColor) : "transparent";
                    const formattedDate = formatDate(date);
                    const tooltipText = inRange
                      ? points > 0 ? `Ganhou ${points} pontos em ${formattedDate}` : `Não ganhou pontos em ${formattedDate}`
                      : "";
                    const showBelow = rowIdx <= 1;
                    return (
                      <div
                        key={date}
                        style={{ width: CELL, height: CELL, backgroundColor: color, borderRadius: 2, position: "relative" }}
                        onMouseEnter={() => inRange && setHoveredDate(date)}
                        onMouseLeave={() => setHoveredDate(null)}
                      >
                        {hoveredDate === date && tooltipText && (
                          <div className={`absolute ${showBelow ? "top-full mt-1" : "bottom-full mb-1"} left-1/2 -translate-x-1/2 z-20 whitespace-nowrap pointer-events-none`}>
                            <div className="bg-[#002017] text-white text-[10px] rounded px-2 py-1 shadow-lg">{tooltipText}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] justify-end" style={{ color: labelColor ?? "#6b7280" }}>
            <span>Menos</span>
            {[emptyColor, "#86efac", "#4ade80", "#16a34a", "#00674F"].map((color) => (
              <div key={color} style={{ width: CELL, height: CELL, backgroundColor: color, borderRadius: 2 }} />
            ))}
            <span>Mais</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContributionCalendar({ days }: ContributionCalendarProps) {
  const { isDark } = useTheme();
  const emptyColor = isDark ? "#3a3a3a" : "#e5e7eb";
  const labelColor = isDark ? "#aaaaaa" : undefined;

  if (!days.length) return null;

  return (
    <>
      {/* Mobile: last 30 days, 3 rows */}
      <div className="md:hidden">
        <MobileCalendar days={days} emptyColor={emptyColor} labelColor={labelColor} isDark={isDark} />
      </div>
      {/* Desktop: full year */}
      <div className="hidden md:block">
        <DesktopCalendar days={days} emptyColor={emptyColor} labelColor={labelColor} isDark={isDark} />
      </div>
    </>
  );
}
