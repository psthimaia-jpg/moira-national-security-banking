import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// ── Design constants ─────────────────────────────────────────
const CYAN = "oklch(0.7 0.15 195)";
const GREEN = "oklch(0.65 0.16 150)";
const RED = "oklch(0.65 0.22 15)";
const AMBER = "oklch(0.78 0.12 75)";
const GOLD = "oklch(0.82 0.14 80)";
const CARD_BORDER = "oklch(0.25 0.03 255)";
const SURFACE_BG = "oklch(0.13 0.018 255)";

type RecoveryStage = {
  id: string;
  label: string;
  startS: number;
  endS: number;
};

const STAGES: RecoveryStage[] = [
  { id: "snapshot", label: "SNAPSHOT VERIFY", startS: 0, endS: 10 },
  { id: "canister", label: "CANISTER RESTORE", startS: 10, endS: 25 },
  { id: "msim", label: "M.SIM REBIND", startS: 25, endS: 38 },
  { id: "liquidity", label: "LIQUIDITY UNLOCK", startS: 38, endS: 45 },
];

type Phase = "idle" | "blackout" | "recovering" | "done";

function generateHash(): string {
  const bytes = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0"),
  );
  return bytes.join("").toUpperCase();
}

// Node diagram component
function TopologyDiagram({ phase }: { phase: Phase }) {
  const usaOnline = phase === "idle" || phase === "done";
  const usaActive = phase === "idle";
  const indiaPulse = true;

  const nodeColor = (online: boolean, active: boolean) => {
    if (!online) return RED;
    if (active) return GREEN;
    return CYAN;
  };

  const usaColor = nodeColor(usaOnline, usaActive);
  const indiaColor = GREEN;

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        background: SURFACE_BG,
        border: `1px solid ${CARD_BORDER}`,
        height: 160,
      }}
    >
      {/* Grid lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        style={{ pointerEvents: "none" }}
        aria-hidden="true"
      >
        {["12.5", "25", "37.5", "50", "62.5", "75", "87.5"].map((y) => (
          <line
            key={`h-${y}`}
            x1="0%"
            y1={`${y}%`}
            x2="100%"
            y2={`${y}%`}
            stroke={CYAN}
            strokeWidth="0.5"
          />
        ))}
        {[
          "8.33",
          "16.66",
          "25",
          "33.33",
          "41.66",
          "50",
          "58.33",
          "66.66",
          "75",
          "83.33",
          "91.66",
        ].map((x) => (
          <line
            key={`v-${x}`}
            x1={`${x}%`}
            y1="0%"
            x2={`${x}%`}
            y2="100%"
            stroke={CYAN}
            strokeWidth="0.5"
          />
        ))}
      </svg>

      {/* SVG arcs */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
        viewBox="0 0 400 160"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Arc IN-NORTH → US-EAST */}
        <path
          d="M 100 60 Q 200 10 300 55"
          fill="none"
          stroke={usaOnline ? CYAN : RED}
          strokeWidth="1"
          strokeDasharray="4 3"
          opacity="0.7"
        />
        {/* Arc IN-SOUTH → US-WEST */}
        <path
          d="M 100 105 Q 200 150 300 110"
          fill="none"
          stroke={usaOnline ? CYAN : RED}
          strokeWidth="1"
          strokeDasharray="4 3"
          opacity="0.7"
        />
        {/* Pulse dots on arcs (animate) */}
        {usaOnline && (
          <>
            <circle r="3" fill={CYAN} opacity="0.9">
              <animateMotion dur="2.5s" repeatCount="indefinite">
                <mpath href="#arc1" />
              </animateMotion>
            </circle>
            <circle r="3" fill={CYAN} opacity="0.9">
              <animateMotion dur="3s" repeatCount="indefinite" begin="1.2s">
                <mpath href="#arc2" />
              </animateMotion>
            </circle>
          </>
        )}
        <defs>
          <path id="arc1" d="M 100 60 Q 200 10 300 55" />
          <path id="arc2" d="M 100 105 Q 200 150 300 110" />
        </defs>
        {/* 6G URLLC label */}
        <text
          x="200"
          y="28"
          fill={CYAN}
          fontSize="7"
          textAnchor="middle"
          fontFamily="monospace"
          opacity="0.8"
        >
          6G URLLC SLICE
        </text>
        <text
          x="200"
          y="148"
          fill={CYAN}
          fontSize="7"
          textAnchor="middle"
          fontFamily="monospace"
          opacity="0.8"
        >
          6G URLLC SLICE
        </text>
      </svg>

      {/* INDIA side */}
      <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-center gap-2 w-28">
        <div className="text-center">
          <div
            className="text-[8px] font-mono font-bold mb-1"
            style={{ color: "oklch(0.5 0.04 150)" }}
          >
            ◆ MOTOKO ACTOR ANCHOR
          </div>
          <NodeBadge label="IN-NORTH" color={indiaColor} pulse={indiaPulse} />
          <NodeBadge label="IN-SOUTH" color={indiaColor} pulse={indiaPulse} />
          <div
            className="mt-1.5 px-1 py-0.5 rounded text-[7px] font-mono font-bold text-center"
            style={{
              background: "oklch(0.18 0.06 150 / 0.3)",
              border: "1px solid oklch(0.5 0.14 150 / 0.4)",
              color: GREEN,
            }}
          >
            $30T ASSET STATE
            <br />
            <span style={{ color: GOLD }}>IMMUTABLE</span>
          </div>
        </div>
      </div>

      {/* USA side */}
      <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-center gap-2 w-28">
        <div className="text-center">
          <div
            className="text-[8px] font-mono font-bold mb-1"
            style={{ color: "oklch(0.5 0.04 220)" }}
          >
            ◆ USA M.SIM NODE
          </div>
          <NodeBadge
            label="US-EAST"
            color={usaColor}
            pulse={usaActive}
            dimmed={phase === "blackout"}
          />
          <NodeBadge
            label="US-WEST"
            color={usaColor}
            pulse={usaActive}
            dimmed={phase === "blackout"}
          />
          {phase === "blackout" && (
            <div
              className="mt-1.5 px-1 py-0.5 rounded text-[7px] font-mono font-bold text-center animate-pulse"
              style={{
                background: "oklch(0.14 0.08 15 / 0.4)",
                border: "1px solid oklch(0.55 0.22 15 / 0.6)",
                color: RED,
              }}
            >
              BLACKOUT
            </div>
          )}
          {phase === "done" && (
            <div
              className="mt-1.5 px-1 py-0.5 rounded text-[7px] font-mono font-bold text-center"
              style={{
                background: "oklch(0.16 0.06 150 / 0.3)",
                border: "1px solid oklch(0.5 0.14 150 / 0.4)",
                color: GREEN,
              }}
            >
              RESTORED
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NodeBadge({
  label,
  color,
  pulse,
  dimmed,
}: {
  label: string;
  color: string;
  pulse?: boolean;
  dimmed?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-1 justify-center mb-1"
      style={{ opacity: dimmed ? 0.4 : 1, transition: "opacity 0.5s" }}
    >
      <span className="relative inline-flex items-center justify-center w-2 h-2">
        {pulse && !dimmed && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-60"
            style={{ background: color }}
          />
        )}
        <span
          className="relative w-1.5 h-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 4px ${color}` }}
        />
      </span>
      <span className="text-[9px] font-mono font-bold" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

function StageRow({
  stage,
  elapsed,
}: {
  stage: RecoveryStage;
  elapsed: number;
}) {
  const isDone = elapsed >= stage.endS;
  const isActive = elapsed >= stage.startS && elapsed < stage.endS;
  const progress = isActive
    ? ((elapsed - stage.startS) / (stage.endS - stage.startS)) * 100
    : isDone
      ? 100
      : 0;

  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
      style={{
        background: isActive
          ? "oklch(0.16 0.04 200 / 0.3)"
          : isDone
            ? "oklch(0.16 0.04 150 / 0.2)"
            : SURFACE_BG,
        border: `1px solid ${
          isActive
            ? "oklch(0.5 0.14 200 / 0.4)"
            : isDone
              ? "oklch(0.5 0.14 150 / 0.3)"
              : CARD_BORDER
        }`,
        transition: "all 0.3s",
      }}
    >
      {/* Status icon */}
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
        {isDone ? (
          <span style={{ color: GREEN, fontSize: 14 }}>✓</span>
        ) : isActive ? (
          <svg
            className="animate-spin w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke={CYAN}
              strokeWidth="2"
              strokeDasharray="15 35"
            />
          </svg>
        ) : (
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: "oklch(0.3 0.03 255)" }}
          />
        )}
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[10px] font-mono font-bold leading-tight"
          style={{
            color: isDone ? GREEN : isActive ? CYAN : "oklch(0.4 0.04 255)",
          }}
        >
          {stage.label}
        </p>
        {(isActive || isDone) && (
          <div
            className="mt-0.5 rounded-full overflow-hidden"
            style={{ background: "oklch(0.22 0.03 255)", height: 2 }}
          >
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              style={{
                background: isDone ? GREEN : CYAN,
                height: "100%",
                borderRadius: 9999,
              }}
            />
          </div>
        )}
      </div>

      {/* Time range */}
      <span
        className="text-[8px] font-mono flex-shrink-0"
        style={{ color: "oklch(0.4 0.04 255)" }}
      >
        {stage.startS}s–{stage.endS}s
      </span>
    </div>
  );
}

export default function KillSwitchRecovery() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [snapshotHash, setSnapshotHash] = useState(generateHash());
  const intervalRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  // Regenerate snapshot hash every 8s
  useEffect(() => {
    const id = setInterval(() => setSnapshotHash(generateHash()), 8000);
    return () => clearInterval(id);
  }, []);

  // Handle blackout + recovery sequence
  const triggerBlackout = () => {
    if (phase !== "idle") return;
    setPhase("blackout");
    setElapsed(0);

    // After 1.5s enter recovering phase and start timer
    setTimeout(() => {
      setPhase("recovering");
      let t = 0;
      tickRef.current = window.setInterval(() => {
        t += 0.2;
        setElapsed(t);
        if (t >= 45) {
          clearInterval(tickRef.current!);
          setPhase("done");
        }
      }, 200);
    }, 1500);
  };

  const resetDemo = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("idle");
    setElapsed(0);
  };

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  return (
    <div
      className="mx-3 mt-3 rounded-xl overflow-hidden"
      style={{
        border: "1px solid oklch(0.55 0.22 15 / 0.5)",
        background: "oklch(0.13 0.025 255)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 border-b"
        style={{
          borderColor: "oklch(0.22 0.025 255)",
          background:
            "linear-gradient(90deg, oklch(0.16 0.04 15 / 0.3), oklch(0.13 0.025 255))",
        }}
      >
        <span className="text-base">⚡</span>
        <p
          className="text-xs font-mono font-bold"
          style={{ color: "oklch(0.78 0.18 15)" }}
        >
          Anti-Fragile Kill Switch & Cold Start Recovery
        </p>
        <div
          className="ml-auto px-2 py-0.5 rounded-full text-[8px] font-mono"
          style={{
            background: "oklch(0.55 0.22 15 / 0.12)",
            border: "1px solid oklch(0.55 0.22 15 / 0.35)",
            color: "oklch(0.65 0.18 15)",
          }}
        >
          SENATE DEMO
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* DEMO disclaimer */}
        <div
          className="px-2 py-1 rounded text-[8px] font-mono text-center"
          style={{
            background: "oklch(0.16 0.04 60 / 0.2)",
            border: "1px solid oklch(0.55 0.14 60 / 0.3)",
            color: "oklch(0.6 0.1 60)",
          }}
        >
          DEMO — Simulated Recovery Sequence · US Senate / Treasury Presentation
        </div>

        {/* Topology Diagram */}
        <TopologyDiagram phase={phase} />

        {/* Motoko Actor Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Actor Count", value: "847" },
            {
              label: "Snapshot Hash",
              value: `${snapshotHash.slice(0, 12)}…`,
            },
            { label: "Recovery Integrity", value: "100%" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg px-2 py-2 text-center"
              style={{
                background: SURFACE_BG,
                border: `1px solid ${CARD_BORDER}`,
              }}
            >
              <p
                className="text-[8px] font-mono mb-0.5"
                style={{ color: "oklch(0.45 0.04 255)" }}
              >
                {stat.label}
              </p>
              <p
                className="text-[10px] font-mono font-bold"
                style={{ color: CYAN }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Blackout alert banner */}
        <AnimatePresence>
          {(phase === "blackout" || phase === "recovering") && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg px-3 py-2 text-[10px] font-mono font-bold text-center animate-pulse"
              style={{
                background: "oklch(0.14 0.06 15 / 0.5)",
                border: "1px solid oklch(0.55 0.22 15 / 0.6)",
                color: RED,
              }}
            >
              🔴 USA SYSTEMIC BLACKOUT — INDIA NODE HOLDING STATE
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success banner */}
        <AnimatePresence>
          {phase === "done" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              data-ocid="kill_switch.success_state"
              className="rounded-lg px-3 py-2.5 text-[11px] font-mono font-bold text-center"
              style={{
                background: "oklch(0.16 0.06 80 / 0.3)",
                border: `1px solid ${GOLD}`,
                color: GOLD,
                boxShadow: `0 0 16px ${GOLD}30`,
              }}
            >
              ✅ FULL LIQUIDITY RESTORED — 44.8s
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recovery Stages (shown during + after) */}
        {(phase === "recovering" || phase === "done") && (
          <div data-ocid="kill_switch.loading_state" className="space-y-1.5">
            {/* Elapsed timer */}
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-[9px] font-mono font-bold"
                style={{ color: CYAN }}
              >
                COLD START RECOVERY IN PROGRESS
              </span>
              <span
                className="text-[10px] font-mono font-bold tabular-nums"
                style={{
                  color: phase === "done" ? GREEN : AMBER,
                }}
              >
                {phase === "done"
                  ? "44.8s ✓"
                  : `${elapsed.toFixed(1)}s / 60s target`}
              </span>
            </div>

            {STAGES.map((stage) => (
              <StageRow
                key={stage.id}
                stage={stage}
                elapsed={phase === "done" ? 100 : elapsed}
              />
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {phase === "idle" && (
            <Button
              data-ocid="kill_switch.button"
              size="sm"
              className="flex-1 text-[10px] font-mono font-bold"
              style={{
                background: "oklch(0.22 0.08 15)",
                border: `1px solid ${RED}`,
                color: RED,
              }}
              onClick={triggerBlackout}
            >
              ⚡ SIMULATE USA BLACKOUT
            </Button>
          )}
          {(phase === "blackout" || phase === "recovering") && (
            <div
              className="flex-1 px-3 py-1.5 rounded-md text-[10px] font-mono text-center"
              style={{
                background: "oklch(0.16 0.04 15 / 0.3)",
                border: `1px solid ${RED}`,
                color: "oklch(0.55 0.15 15)",
              }}
            >
              Recovery sequence running…
            </div>
          )}
          {phase === "done" && (
            <Button
              data-ocid="kill_switch.reset_button"
              size="sm"
              className="flex-1 text-[10px] font-mono font-bold"
              style={{
                background: "oklch(0.18 0.03 255)",
                border: `1px solid ${CYAN}`,
                color: CYAN,
              }}
              onClick={resetDemo}
            >
              ↺ Reset Demo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
