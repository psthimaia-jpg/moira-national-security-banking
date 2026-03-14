import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const CYAN = "oklch(0.7 0.15 195)";
const GREEN = "oklch(0.65 0.16 150)";
const AMBER = "oklch(0.78 0.12 75)";
const CARD_BG = "oklch(0.155 0.022 255)";
const CARD_BORDER = "oklch(0.25 0.03 255)";
const SURFACE_BG = "oklch(0.13 0.018 255)";

function randBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function formatTimestamp(d: Date): string {
  return `${d.toLocaleTimeString("en-IN", { hour12: false })} IST`;
}

export default function PAM360Telemetry() {
  const [sessions, setSessions] = useState(5);
  const [events, setEvents] = useState(147);
  const [trustScore, setTrustScore] = useState(98.6);
  const [lastAuth, setLastAuth] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setSessions(Math.round(randBetween(3, 7)));
      setEvents((prev) => prev + Math.round(randBetween(0, 2)));
      setTrustScore((prev) => {
        const delta = (Math.random() - 0.5) * 0.6;
        return +Math.min(99.9, Math.max(97.5, prev + delta)).toFixed(1);
      });
      setLastAuth(new Date());
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      data-ocid="pam360.panel"
      className="mx-3 mt-3 rounded-xl overflow-hidden"
      style={{
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        boxShadow: "0 0 20px oklch(0.7 0.15 195 / 0.06)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 border-b"
        style={{
          borderColor: "oklch(0.22 0.025 255)",
          background:
            "linear-gradient(90deg, oklch(0.18 0.04 200 / 0.4), oklch(0.155 0.022 255))",
        }}
      >
        <div className="flex items-center gap-1.5">
          {/* PAM360 logo-style */}
          <span
            className="text-xs font-mono font-black tracking-tight px-1.5 py-0.5 rounded"
            style={{
              background: "oklch(0.22 0.06 200 / 0.5)",
              border: `1px solid ${CYAN}`,
              color: CYAN,
              letterSpacing: "0.02em",
            }}
          >
            ME
          </span>
          <span
            className="text-xs font-mono font-bold"
            style={{ color: "oklch(0.88 0.06 200)" }}
          >
            ManageEngine PAM360
          </span>
        </div>

        {/* LIVE dot */}
        <div className="flex items-center gap-1 ml-1">
          <span
            className="relative inline-flex w-1.5 h-1.5 rounded-full"
            style={{ background: GREEN }}
          >
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-75"
              style={{ background: GREEN }}
            />
          </span>
          <span
            className="text-[9px] font-mono font-bold"
            style={{ color: GREEN }}
          >
            LIVE
          </span>
        </div>

        <div
          className="ml-auto text-[8px] font-mono"
          style={{ color: "oklch(0.45 0.04 255)" }}
        >
          USA M.SIM Slot · Privileged Access Telemetry
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* 4 Metric tiles */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MetricTile
            label="Active Sessions"
            value={String(sessions)}
            unit=""
            accent={CYAN}
          />
          <MetricTile
            label="Priv. Access Events (24h)"
            value={String(events)}
            unit=""
            accent="oklch(0.72 0.18 270)"
          />
          <MetricTile
            label="Hardware Trust Score"
            value={trustScore.toFixed(1)}
            unit="%"
            accent={GREEN}
          />
          <MetricTile
            label="Last Auth"
            value={formatTimestamp(lastAuth)}
            unit=""
            accent={AMBER}
            small
          />
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          <StatusBadge
            label="TELEMETRY ACTIVE"
            color={GREEN}
            bgColor="oklch(0.65 0.16 150 / 0.12)"
            borderColor="oklch(0.65 0.16 150 / 0.4)"
          />
          <StatusBadge
            label="HARDWARE BOUND"
            color={CYAN}
            bgColor="oklch(0.7 0.15 195 / 0.12)"
            borderColor="oklch(0.7 0.15 195 / 0.4)"
          />
          <StatusBadge
            label="ZERO-TRUST ENFORCED"
            color={AMBER}
            bgColor="oklch(0.78 0.12 75 / 0.12)"
            borderColor="oklch(0.78 0.12 75 / 0.4)"
          />
        </div>

        {/* Open console button (disabled) */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <button
                  type="button"
                  data-ocid="pam360.button"
                  disabled
                  className="w-full px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold cursor-not-allowed"
                  style={{
                    background: "oklch(0.18 0.022 255)",
                    border: "1px solid oklch(0.28 0.03 255)",
                    color: "oklch(0.4 0.04 255)",
                    opacity: 0.7,
                  }}
                >
                  🔗 Open PAM360 Console
                </button>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-60 text-center"
              style={{
                background: "oklch(0.18 0.03 255)",
                border: `1px solid ${CARD_BORDER}`,
                color: "oklch(0.8 0.05 255)",
                fontSize: 10,
              }}
            >
              Direct deep-link available in production deployment with
              ManageEngine PAM360 on-premise instance
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Separator + disclaimer */}
        <div
          className="pt-2 border-t"
          style={{ borderColor: "oklch(0.22 0.025 255)" }}
        >
          <p
            className="text-[8px] font-mono text-center"
            style={{ color: "oklch(0.38 0.04 255)" }}
          >
            DEMO — Simulated telemetry feed. ManageEngine PAM360 is a
            third-party product; this panel represents planned integration
            architecture.
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  unit,
  accent,
  small,
}: {
  label: string;
  value: string;
  unit: string;
  accent: string;
  small?: boolean;
}) {
  return (
    <motion.div
      key={value}
      initial={{ opacity: 0.7 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg px-2 py-2 text-center"
      style={{
        background: SURFACE_BG,
        border: `1px solid ${CARD_BORDER}`,
      }}
    >
      <p
        className="text-[8px] font-mono mb-1 leading-tight"
        style={{ color: "oklch(0.45 0.04 255)" }}
      >
        {label}
      </p>
      <p
        className={`font-mono font-bold leading-tight ${
          small ? "text-[9px]" : "text-sm"
        }`}
        style={{ color: accent }}
      >
        {value}
        {unit}
      </p>
    </motion.div>
  );
}

function StatusBadge({
  label,
  color,
  bgColor,
  borderColor,
}: {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[8px] font-mono font-bold"
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        color,
      }}
    >
      {label}
    </span>
  );
}
