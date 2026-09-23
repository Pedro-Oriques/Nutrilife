"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const ZONES = [
  { label: "Abaixo do peso", max: 18.5, color: "#60A5FA" },
  { label: "Normal", max: 25, color: "#00674F" },
  { label: "Sobrepeso", max: 30, color: "#FBBF24" },
  { label: "Obeso", max: Infinity, color: "#EF4444" },
];

const IMC_MIN = 10;
const IMC_MAX = 40;

export function calculateIMC(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function imcToAngle(imc: number): number {
  const clamped = Math.max(IMC_MIN, Math.min(IMC_MAX, imc));
  return 180 - ((clamped - IMC_MIN) / (IMC_MAX - IMC_MIN)) * 180;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = startAngle - endAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function getZoneLabel(imc: number): { label: string; color: string } {
  for (const zone of ZONES) {
    if (imc < zone.max) return { label: zone.label, color: zone.color };
  }
  return { label: ZONES[ZONES.length - 1].label, color: ZONES[ZONES.length - 1].color };
}

const ZONE_BOUNDARIES = [
  { angle: 180 },
  { angle: imcToAngle(18.5) },
  { angle: imcToAngle(25) },
  { angle: imcToAngle(30) },
  { angle: 0 },
];

function imcToRotationDeg(imc: number): number {
  const clamped = Math.max(IMC_MIN, Math.min(IMC_MAX, imc));
  return -90 + ((clamped - IMC_MIN) / (IMC_MAX - IMC_MIN)) * 180;
}

interface IMCGaugeProps {
  imc: number;
  weight: number;
  height: number;
}

export default function IMCGauge({ imc, weight, height }: IMCGaugeProps) {
  const { isDark } = useTheme();
  const needleColor = isDark ? "#ffffff" : "#4B5563";
  // On first mount: sweep from -90 (bottom/left) to target.
  // On subsequent imc changes: move directly from current angle to new target.
  const [displayedRotation, setDisplayedRotation] = useState(-90);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!height || height === 0) return;

    if (!isMounted.current) {
      isMounted.current = true;
      const t = setTimeout(() => {
        setDisplayedRotation(imcToRotationDeg(imc));
      }, 100);
      return () => clearTimeout(t);
    } else {
      setDisplayedRotation(imcToRotationDeg(imc));
    }
  }, [imc, height]);

  if (!height || height === 0) {
    return (
      <div className="flex items-center justify-center w-full h-[140px] text-gray-500 text-sm text-center px-4">
        Complete seu perfil para ver o IMC
      </div>
    );
  }

  const cx = 110;
  const cy = 110;
  const r = 90;
  const strokeWidth = 20;

  const { label, color } = getZoneLabel(imc);
  const imcDisplay = imc.toFixed(1);

  return (
    <div className="flex flex-col items-center w-full">
      <svg
        viewBox="0 0 220 120"
        width="100%"
        style={{ maxWidth: 280 }}
        aria-label={`IMC: ${imcDisplay} — ${label}`}
      >
        {ZONES.map((zone, i) => (
          <path
            key={zone.label}
            d={arcPath(cx, cy, r, ZONE_BOUNDARIES[i].angle, ZONE_BOUNDARIES[i + 1].angle)}
            fill="none"
            stroke={zone.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />
        ))}

        <g
          style={{
            transform: `rotate(${displayedRotation}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - (r - 12)}
            stroke={needleColor}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <polygon
            points={`${cx},${cy - (r - 8)} ${cx - 4},${cy - (r - 22)} ${cx + 4},${cy - (r - 22)}`}
            fill={needleColor}
          />
        </g>

        <circle cx={cx} cy={cy} r={7} fill={needleColor} />
      </svg>

      <div className="flex flex-col items-center -mt-1">
        <span className="text-2xl font-bold" style={{ color: isDark ? "#ffffff" : "#4B5563" }}>{imcDisplay}</span>
        <span className="text-sm font-semibold mt-0.5" style={{ color }}>
          {label}
        </span>
      </div>
    </div>
  );
}
