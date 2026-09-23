"use client";

import { useRef, useState, useEffect } from "react";

// Card dimensions — smaller on mobile, full size on md+
const CARD_WIDTH_SM = 52;
const CARD_WIDTH_MD = 72;
const CARD_GAP_SM = 8;
const CARD_GAP_MD = 12;
const ARROW_WIDTH = 40;

interface DatePickerProps {
  dateRange: Date[];
  selectedDate: Date;
  onSelect: (d: Date) => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function DatePicker({
  dateRange,
  selectedDate,
  onSelect,
  onPrev,
  onNext,
}: DatePickerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(dateRange.length);
  const [isMd, setIsMd] = useState(false);

  useEffect(() => {
    const compute = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const md = el.clientWidth >= 640;
      setIsMd(md);
      const cardW = md ? CARD_WIDTH_MD : CARD_WIDTH_SM;
      const gap = md ? CARD_GAP_MD : CARD_GAP_SM;
      const available = el.clientWidth - ARROW_WIDTH * 2 - gap * 2;
      const count = Math.max(1, Math.floor((available + gap) / (cardW + gap)));
      setVisibleCount(Math.min(count, dateRange.length));
    };

    compute();
    const ro = new ResizeObserver(compute);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [dateRange.length]);

  const gap = isMd ? CARD_GAP_MD : CARD_GAP_SM;
  const visible = dateRange.slice(0, visibleCount);

  return (
    <div ref={wrapperRef} className="flex items-center w-full mb-8" style={{ gap }}>
      <button
        onClick={onPrev}
        className="p-2 text-secondary-700 hover:text-secondary-400 font-extrabold text-2xl transition shrink-0"
      >
        &lt;
      </button>

      <div className="flex flex-1" style={{ gap }}>
        {visible.map((d) => {
          const isSelected = d.toDateString() === selectedDate.toDateString();
          return (
            <button
              key={d.toDateString()}
              onClick={() => onSelect(d)}
              className={`flex flex-col items-center justify-center border-[1.5px] rounded-xl transition-all flex-1 ${
                isMd ? "h-[86px]" : "h-[64px]"
              } ${
                isSelected
                  ? "bg-[#00D194] border-[#00D194] text-white shadow-md"
                  : "bg-transparent border-[#00674F] text-[#00674F] hover:bg-green-50 dark:hover:bg-white/5"
              }`}
            >
              <span className={`font-extrabold leading-none mb-0.5 ${isMd ? "text-[28px]" : "text-[20px]"}`}>
                {d.getDate().toString().padStart(2, "0")}
              </span>
              <span className={`font-medium tracking-wide ${isMd ? "text-[15px]" : "text-[11px]"}`}>
                {d.toLocaleString("pt-BR", { month: "short" }).replace(".", "")}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        className="p-2 text-secondary-700 hover:text-secondary-400 font-extrabold text-2xl transition shrink-0"
      >
        &gt;
      </button>
    </div>
  );
}
