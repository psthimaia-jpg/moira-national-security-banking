import {
  Activity,
  ChevronDown,
  ChevronUp,
  Heart,
  Shield,
  Wind,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ── Types ───────────────────────────────────────────────────
type BioStatus = "NORMAL" | "ELEVATED" | "DISTRESS";

interface BioReadings {
  heartRate: number;
  bpSystolic: number;
  bpDiastolic: number;
  spo2: number;
}

interface BioSovereignBarProps {
  onDistressDetected: () => void;
  inactionActive: boolean;
  onStatusChange?: (status: BioStatus) => void;
}

// ── Color map ───────────────────────────────────────────────
const STATUS_COLORS: Record<
  BioStatus,
  { bg: string; border: string; text: string; dot: string }
> = {
  NORMAL: {
    bg: "oklch(0.13 0.025 150 / 0.4)",
    border: "oklch(0.45 0.14 150 / 0.35)",
    text: "oklch(0.75 0.17 150)",
    dot: "oklch(0.7 0.17 150)",
  },
  ELEVATED: {
    bg: "oklch(0.13 0.025 75 / 0.45)",
    border: "oklch(0.55 0.1 75 / 0.4)",
    text: "oklch(0.78 0.12 75)",
    dot: "oklch(0.78 0.12 75)",
  },
  DISTRESS: {
    bg: "oklch(0.13 0.025 18 / 0.6)",
    border: "oklch(0.55 0.2 18 / 0.5)",
    text: "oklch(0.75 0.18 18)",
    dot: "oklch(0.75 0.18 18)",
  },
};

// ── Helpers ─────────────────────────────────────────────────
function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function getRandomVariance(base: number, variance: number) {
  return base + (Math.random() - 0.5) * 2 * variance;
}

function computeStatus(readings: BioReadings): BioStatus {
  const { heartRate, bpSystolic, spo2 } = readings;
  if (heartRate > 108 || bpSystolic > 142 || spo2 < 94) return "DISTRESS";
  if (heartRate > 95 || bpSystolic > 130) return "ELEVATED";
  return "NORMAL";
}

// ── Main Component ──────────────────────────────────────────
export default function BioSovereignBar({
  onDistressDetected,
  inactionActive,
  onStatusChange,
}: BioSovereignBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [readings, setReadings] = useState<BioReadings>({
    heartRate: 72,
    bpSystolic: 118,
    bpDiastolic: 76,
    spo2: 98,
  });
  const [status, setStatus] = useState<BioStatus>("NORMAL");
  const distressCalledRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  // ── Bio reading simulation ──────────────────────────────
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setReadings((prev) => {
        const next: BioReadings = {
          heartRate: Math.round(
            clamp(getRandomVariance(prev.heartRate, 3), 55, 130),
          ),
          bpSystolic: Math.round(
            clamp(getRandomVariance(prev.bpSystolic, 4), 95, 155),
          ),
          bpDiastolic: Math.round(
            clamp(getRandomVariance(prev.bpDiastolic, 3), 60, 100),
          ),
          spo2: Math.round(clamp(getRandomVariance(prev.spo2, 0.8), 91, 100)),
        };
        const nextStatus = computeStatus(next);
        setStatus((prevStatus) => {
          if (prevStatus !== nextStatus && onStatusChangeRef.current) {
            onStatusChangeRef.current(nextStatus);
          }
          return nextStatus;
        });
        return next;
      });
    }, 2500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ── Distress callback (once per event) ──────────────────
  useEffect(() => {
    if (
      status === "DISTRESS" &&
      !distressCalledRef.current &&
      !inactionActive
    ) {
      distressCalledRef.current = true;
      onDistressDetected();
      toast.error(
        "Bio-Sensor: Distress spike detected — Inaction Safety auto-engaged",
        {
          duration: 4000,
        },
      );
    }
    if (status !== "DISTRESS") {
      distressCalledRef.current = false;
    }
  }, [status, inactionActive, onDistressDetected]);

  const colors = STATUS_COLORS[status];
  const isDistress = status === "DISTRESS";

  return (
    <div
      className="border-b transition-all duration-300"
      style={{
        background: isDistress ? "oklch(0.12 0.03 18 / 0.8)" : colors.bg,
        borderColor: colors.border,
      }}
    >
      {/* ── Compact strip ────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-1.5">
        {/* Left: shield + label */}
        <div className="flex items-center gap-2 min-w-0">
          <Shield
            className="w-3 h-3 flex-shrink-0"
            style={{ color: colors.text }}
          />
          <span
            className="text-[9px] font-mono-code font-bold tracking-widest uppercase flex-shrink-0"
            style={{ color: colors.text }}
          >
            Di=AI FIREWALL
          </span>

          {/* Status badge */}
          <motion.div
            data-ocid="bio_sensor.status"
            animate={isDistress ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: `${colors.dot.replace(")", " / 0.15)")}`,
              border: `1px solid ${colors.dot.replace(")", " / 0.35)")}`,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: colors.dot,
                boxShadow: isDistress ? `0 0 6px ${colors.dot}` : "none",
              }}
            />
            <span
              className="text-[8px] font-mono-code font-bold tracking-widest"
              style={{ color: colors.text }}
            >
              {status}
            </span>
          </motion.div>

          {/* Heart rate quick read */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Heart className="w-2.5 h-2.5" style={{ color: colors.text }} />
            <motion.span
              key={readings.heartRate}
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[9px] font-mono-code tabular-nums"
              style={{ color: colors.text }}
            >
              {readings.heartRate}
              <span
                className="text-[7px] ml-0.5"
                style={{ color: `${colors.text.replace(")", " / 0.6)")}` }}
              >
                BPM
              </span>
            </motion.span>
          </div>

          {/* Distress label */}
          {isDistress && (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 0.7, repeat: Number.POSITIVE_INFINITY }}
              className="text-[8px] font-mono-code font-bold tracking-widest uppercase flex-shrink-0"
              style={{ color: "oklch(0.75 0.18 18)" }}
            >
              AUTO-ENGAGING INACTION
            </motion.span>
          )}
        </div>

        {/* Right: expand chevron */}
        <button
          type="button"
          data-ocid="bio_sensor.toggle"
          onClick={() => setExpanded((v) => !v)}
          className="w-5 h-5 flex items-center justify-center rounded flex-shrink-0 hover:bg-white/5 transition-colors"
          aria-label={expanded ? "Collapse bio sensor" : "Expand bio sensor"}
        >
          {expanded ? (
            <ChevronUp className="w-3 h-3" style={{ color: colors.text }} />
          ) : (
            <ChevronDown className="w-3 h-3" style={{ color: colors.text }} />
          )}
        </button>
      </div>

      {/* ── Expanded view ────────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* Scan-line effect */}
            <div
              className="relative overflow-hidden"
              style={{ opacity: isDistress ? 0.08 : 0.04 }}
            >
              <div
                className="absolute w-full h-px animate-vault-scan pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent, ${colors.dot}, transparent)`,
                }}
              />
            </div>

            {inactionActive ? (
              /* Paused state */
              <div
                className="mx-3 mb-2.5 rounded-xl px-3 py-2.5 flex items-center justify-center gap-2"
                style={{
                  background: "oklch(0.15 0.02 255 / 0.6)",
                  border: "1px solid oklch(0.28 0.03 255 / 0.5)",
                }}
              >
                <Shield
                  className="w-3.5 h-3.5"
                  style={{ color: "oklch(0.55 0.04 255)" }}
                />
                <span
                  className="text-[10px] font-mono-code tracking-widest uppercase"
                  style={{ color: "oklch(0.5 0.04 255)" }}
                >
                  MONITORING PAUSED — INACTION ACTIVE
                </span>
              </div>
            ) : (
              /* Metrics row */
              <div className="grid grid-cols-3 gap-2 px-3 pb-3">
                {/* Heart Rate */}
                <MetricCard
                  icon={Heart}
                  label="Heart Rate"
                  value={`${readings.heartRate}`}
                  unit="BPM"
                  subtext={
                    readings.heartRate > 108
                      ? "DISTRESS"
                      : readings.heartRate > 95
                        ? "ELEVATED"
                        : "NORMAL"
                  }
                  color={colors.dot}
                  status={status}
                  threshold={
                    readings.heartRate > 108
                      ? "high"
                      : readings.heartRate > 95
                        ? "warn"
                        : "ok"
                  }
                />
                {/* Blood Pressure */}
                <MetricCard
                  icon={Activity}
                  label="Blood Pressure"
                  value={`${readings.bpSystolic}/${readings.bpDiastolic}`}
                  unit="mmHg"
                  subtext={
                    readings.bpSystolic > 142
                      ? "DISTRESS"
                      : readings.bpSystolic > 130
                        ? "ELEVATED"
                        : "NORMAL"
                  }
                  color={colors.dot}
                  status={status}
                  threshold={
                    readings.bpSystolic > 142
                      ? "high"
                      : readings.bpSystolic > 130
                        ? "warn"
                        : "ok"
                  }
                />
                {/* SpO2 */}
                <MetricCard
                  icon={Wind}
                  label="SpO₂"
                  value={`${readings.spo2}`}
                  unit="%"
                  subtext={
                    readings.spo2 < 94
                      ? "DISTRESS"
                      : readings.spo2 < 96
                        ? "LOW"
                        : "NORMAL"
                  }
                  color={colors.dot}
                  status={status}
                  threshold={
                    readings.spo2 < 94
                      ? "high"
                      : readings.spo2 < 96
                        ? "warn"
                        : "ok"
                  }
                />
              </div>
            )}

            {/* Bottom label */}
            <div className="px-3 pb-2 flex items-center justify-between">
              <span
                className="text-[8px] font-mono-code tracking-widest"
                style={{ color: `${colors.text.replace(")", " / 0.5)")}` }}
              >
                BIO-SOVEREIGN SECURITY LAYER · SIMULATED
              </span>
              <div className="flex items-center gap-1">
                <div
                  className="w-1 h-1 rounded-full animate-pulse-dot"
                  style={{ background: colors.dot }}
                />
                <span
                  className="text-[7px] font-mono-code"
                  style={{ color: `${colors.text.replace(")", " / 0.4)")}` }}
                >
                  LIVE
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── MetricCard sub-component ────────────────────────────────
interface MetricCardProps {
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  label: string;
  value: string;
  unit: string;
  subtext: string;
  color: string;
  status: BioStatus;
  threshold: "ok" | "warn" | "high";
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  subtext,
  color,
  threshold,
}: MetricCardProps) {
  const ringColor =
    threshold === "high"
      ? "oklch(0.75 0.18 18)"
      : threshold === "warn"
        ? "oklch(0.78 0.12 75)"
        : "oklch(0.7 0.17 150)";

  return (
    <div
      className="relative rounded-xl p-2 flex flex-col items-center gap-1.5 overflow-hidden"
      style={{
        background: "oklch(0.14 0.022 255 / 0.8)",
        border: `1px solid ${ringColor.replace(")", " / 0.3)")}`,
        boxShadow:
          threshold === "high"
            ? `0 0 10px ${ringColor.replace(")", " / 0.2)")}`
            : "none",
      }}
    >
      {/* Colored ring indicator */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
        style={{
          background: `linear-gradient(90deg, transparent, ${ringColor}, transparent)`,
          opacity: threshold === "ok" ? 0.4 : 0.9,
        }}
      />

      {/* Icon */}
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center"
        style={{
          background: `${ringColor.replace(")", " / 0.12)")}`,
          border: `1px solid ${ringColor.replace(")", " / 0.25)")}`,
        }}
      >
        <Icon className="w-3 h-3" style={{ color: ringColor }} />
      </div>

      {/* Value */}
      <motion.div
        key={value}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="text-center"
      >
        <p
          className="text-[11px] font-mono-code font-bold tabular-nums leading-tight"
          style={{ color }}
        >
          {value}
          <span
            className="text-[8px] ml-0.5 font-normal"
            style={{ color: `${color.replace(")", " / 0.6)")}` }}
          >
            {unit}
          </span>
        </p>
      </motion.div>

      {/* Label */}
      <p
        className="text-[7px] font-mono-code tracking-widest uppercase text-center leading-tight"
        style={{ color: "oklch(0.55 0.04 255)" }}
      >
        {label}
      </p>

      {/* Status tag */}
      <span
        className="text-[6px] font-mono-code font-bold tracking-widest px-1 py-0.5 rounded"
        style={{
          background: `${ringColor.replace(")", " / 0.1)")}`,
          color: ringColor,
        }}
      >
        {subtext}
      </span>
    </div>
  );
}
