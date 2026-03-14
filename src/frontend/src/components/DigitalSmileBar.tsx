import { Brain, ChevronDown, ChevronUp, Loader2, Smile } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { BehaviorProfile } from "../hooks/useDigitalSmile";

interface DigitalSmileBarProps {
  profile: BehaviorProfile;
  swipeCurrent?: number;
  typingCurrent?: number;
  navCurrent?: number;
  swipeBaseline?: number;
  typingBaseline?: number;
  navBaseline?: number;
  inactionActive: boolean;
}

const DEVIATION_THRESHOLD = 0.4;

function isFlagged(current?: number, baseline?: number): boolean {
  if (current === undefined || baseline === undefined || baseline === 0)
    return false;
  return Math.abs(current - baseline) / baseline > DEVIATION_THRESHOLD;
}

function MetricMini({
  label,
  unit,
  current,
  baseline,
  flagged,
}: {
  label: string;
  unit: string;
  current?: number;
  baseline?: number;
  flagged: boolean;
}) {
  const ringColor = flagged ? "oklch(0.78 0.12 75)" : "oklch(0.7 0.17 150)";

  const formatVal = (v?: number) =>
    v !== undefined ? v.toFixed(v < 1 ? 3 : 0) : "—";

  return (
    <div
      className="rounded-xl p-2 flex flex-col items-center gap-1 overflow-hidden relative"
      style={{
        background: "oklch(0.14 0.022 255 / 0.8)",
        border: `1px solid ${ringColor.replace(")", " / 0.3)")}`,
        boxShadow: flagged
          ? `0 0 8px ${ringColor.replace(")", " / 0.15)")}`
          : "none",
      }}
    >
      {/* top line indicator */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
        style={{
          background: `linear-gradient(90deg, transparent, ${ringColor}, transparent)`,
          opacity: flagged ? 0.9 : 0.4,
        }}
      />
      <span
        className="text-[8px] font-mono-code font-bold tracking-widest uppercase"
        style={{ color: "oklch(0.55 0.04 255)" }}
      >
        {label}
      </span>
      <div className="text-center">
        <span
          className="text-[11px] font-mono-code font-bold tabular-nums"
          style={{ color: ringColor }}
        >
          {formatVal(current)}
        </span>
        <span
          className="text-[7px] font-mono-code ml-0.5"
          style={{ color: `${ringColor.replace(")", " / 0.6)")}` }}
        >
          {unit}
        </span>
      </div>
      {baseline !== undefined && (
        <span
          className="text-[7px] font-mono-code"
          style={{ color: "oklch(0.45 0.03 255)" }}
        >
          base {formatVal(baseline)}
        </span>
      )}
      <span
        className="text-[6px] font-mono-code font-bold tracking-widest px-1 py-0.5 rounded"
        style={{
          background: `${ringColor.replace(")", " / 0.1)")}`,
          color: ringColor,
        }}
      >
        {flagged ? "FLAGGED" : "OK"}
      </span>
    </div>
  );
}

export default function DigitalSmileBar({
  profile,
  swipeCurrent,
  typingCurrent,
  navCurrent,
  swipeBaseline,
  typingBaseline,
  navBaseline,
  inactionActive,
}: DigitalSmileBarProps) {
  const [expanded, setExpanded] = useState(false);

  const swipeFlagged = isFlagged(swipeCurrent, swipeBaseline);
  const typingFlagged = isFlagged(typingCurrent, typingBaseline);
  const navFlagged = isFlagged(navCurrent, navBaseline);

  // Strip colors per profile
  const stripColors = {
    Calibrating: {
      bg: "oklch(0.12 0.02 255 / 0.6)",
      border: "oklch(0.35 0.07 255 / 0.35)",
      text: "oklch(0.55 0.15 255)",
      dot: "oklch(0.55 0.15 255)",
    },
    Generic: {
      bg: "oklch(0.13 0.025 150 / 0.6)",
      border: "oklch(0.45 0.14 150 / 0.35)",
      text: "oklch(0.75 0.17 150)",
      dot: "oklch(0.7 0.17 150)",
    },
    "Non-Generic": {
      bg: "oklch(0.13 0.025 75 / 0.45)",
      border: "oklch(0.55 0.1 75 / 0.4)",
      text: "oklch(0.78 0.12 75)",
      dot: "oklch(0.78 0.12 75)",
    },
  } as const;

  const colors = stripColors[profile];

  return (
    <div
      className="border-b transition-all duration-300"
      style={{
        background: colors.bg,
        borderColor: colors.border,
      }}
    >
      {/* ── Compact strip ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-1.5">
        {/* Left: icon + label + status badge */}
        <div className="flex items-center gap-2 min-w-0">
          {profile === "Calibrating" ? (
            <Loader2
              className="w-3 h-3 flex-shrink-0 animate-spin"
              style={{ color: colors.text }}
            />
          ) : (
            <Brain
              className="w-3 h-3 flex-shrink-0"
              style={{ color: colors.text }}
            />
          )}

          <span
            className="text-[9px] font-mono-code font-bold tracking-widest uppercase flex-shrink-0"
            style={{ color: colors.text }}
          >
            Di=AI BEHAVIORAL DNA
          </span>

          {/* Status badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={profile}
              data-ocid="digital_smile.status"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: `${colors.dot.replace(")", " / 0.15)")}`,
                border: `1px solid ${colors.dot.replace(")", " / 0.35)")}`,
              }}
            >
              {profile === "Generic" && (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="text-[10px] leading-none"
                >
                  :)
                </motion.span>
              )}
              {profile === "Non-Generic" && (
                <motion.div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: colors.dot }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{
                    duration: 0.9,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />
              )}
              {profile === "Calibrating" && (
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    background: colors.dot,
                    opacity: 0.6,
                  }}
                />
              )}
              <span
                className="text-[8px] font-mono-code font-bold tracking-widest"
                style={{ color: colors.text }}
              >
                {profile === "Calibrating"
                  ? "CALIBRATING…"
                  : profile === "Generic"
                    ? "DIGITAL SMILE"
                    : "ANOMALY"}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Label text */}
          <span
            className="text-[8px] font-mono-code hidden sm:inline-block flex-shrink-0"
            style={{ color: `${colors.text.replace(")", " / 0.7)")}` }}
          >
            {profile === "Calibrating"
              ? "ANALYZING SESSION…"
              : profile === "Generic"
                ? "GENERIC BEHAVIOR"
                : "NON-GENERIC PATTERN"}
          </span>
        </div>

        {/* Right: expand/collapse */}
        <button
          type="button"
          data-ocid="digital_smile.toggle"
          onClick={() => setExpanded((v) => !v)}
          className="w-5 h-5 flex items-center justify-center rounded flex-shrink-0 hover:bg-white/5 transition-colors"
          aria-label={
            expanded ? "Collapse behavioral DNA" : "Expand behavioral DNA"
          }
        >
          {expanded ? (
            <ChevronUp className="w-3 h-3" style={{ color: colors.text }} />
          ) : (
            <ChevronDown className="w-3 h-3" style={{ color: colors.text }} />
          )}
        </button>
      </div>

      {/* ── Expanded metrics panel ──────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {inactionActive ? (
              <div
                className="mx-3 mb-2.5 rounded-xl px-3 py-2.5 flex items-center justify-center gap-2"
                style={{
                  background: "oklch(0.15 0.02 255 / 0.6)",
                  border: "1px solid oklch(0.28 0.03 255 / 0.5)",
                }}
              >
                <Smile
                  className="w-3.5 h-3.5"
                  style={{ color: "oklch(0.55 0.04 255)" }}
                />
                <span
                  className="text-[10px] font-mono-code tracking-widest uppercase"
                  style={{ color: "oklch(0.5 0.04 255)" }}
                >
                  BEHAVIORAL TRACKING PAUSED — INACTION ACTIVE
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 px-3 pb-3">
                <MetricMini
                  label="Swipe Vel"
                  unit="px/ms"
                  current={swipeCurrent}
                  baseline={swipeBaseline}
                  flagged={swipeFlagged}
                />
                <MetricMini
                  label="Typing Cad"
                  unit="ms avg"
                  current={typingCurrent}
                  baseline={typingBaseline}
                  flagged={typingFlagged}
                />
                <MetricMini
                  label="Nav Cad"
                  unit="ms avg"
                  current={navCurrent}
                  baseline={navBaseline}
                  flagged={navFlagged}
                />
              </div>
            )}

            {/* Bottom label */}
            <div className="px-3 pb-2 flex items-center justify-between">
              <span
                className="text-[8px] font-mono-code tracking-widest"
                style={{ color: `${colors.text.replace(")", " / 0.5)")}` }}
              >
                BEHAVIORAL DNA LAYER · DIGITAL SMILE PROTOCOL
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
