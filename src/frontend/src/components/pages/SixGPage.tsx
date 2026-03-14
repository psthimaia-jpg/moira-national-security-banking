import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Key,
  Lock,
  Network,
  OctagonX,
  Radio,
  RefreshCw,
  Satellite,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLogSensorEvent } from "../../hooks/useQueries";
import PAM360Telemetry from "../PAM360Telemetry";

// ── Design constants ──────────────────────────────────────
const CYAN = "oklch(0.7 0.15 195)";
const CYAN_DIM = "oklch(0.7 0.15 195 / 0.15)";
const CYAN_BORDER = "oklch(0.7 0.15 195 / 0.3)";
const CARD_BG = "oklch(0.155 0.022 255)";
const CARD_BORDER = "oklch(0.25 0.03 255)";
const SURFACE_BG = "oklch(0.13 0.018 255)";
const GREEN = "oklch(0.65 0.16 150)";
const AMBER = "oklch(0.78 0.12 75)";
const RED = "oklch(0.65 0.22 15)";
const BLUE = "oklch(0.65 0.15 240)";

// ── Types ─────────────────────────────────────────────────
type NodeStatus = "ACTIVE" | "STANDBY" | "FAULT";
type FreqBand = "sub-6GHz" | "mmWave";

interface EdgeNode {
  id: string;
  label: string;
  status: NodeStatus;
  latencyMs: number;
  loadPct: number;
}

const INITIAL_NODES: EdgeNode[] = [
  {
    id: "us-east",
    label: "US-EAST",
    status: "ACTIVE",
    latencyMs: 2,
    loadPct: 67,
  },
  {
    id: "us-west",
    label: "US-WEST",
    status: "ACTIVE",
    latencyMs: 4,
    loadPct: 44,
  },
  {
    id: "eu-central",
    label: "EU-CENTRAL",
    status: "STANDBY",
    latencyMs: 8,
    loadPct: 28,
  },
  { id: "apac", label: "APAC", status: "ACTIVE", latencyMs: 11, loadPct: 55 },
  {
    id: "in-south",
    label: "IN-SOUTH",
    status: "ACTIVE",
    latencyMs: 6,
    loadPct: 72,
  },
  {
    id: "in-north",
    label: "IN-NORTH",
    status: "STANDBY",
    latencyMs: 9,
    loadPct: 33,
  },
];

interface LatencyChannel {
  id: string;
  label: string;
  targetMs: number;
  history: number[];
  current: number;
}

function generateKey(): string {
  const bytes = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0"),
  );
  return bytes.join("").toUpperCase();
}

function fluctuate(
  val: number,
  min: number,
  max: number,
  delta = 0.08,
): number {
  const change = (Math.random() - 0.5) * 2 * delta * (max - min);
  return Math.max(min, Math.min(max, val + change));
}

function randLatency(min: number, max: number): number {
  return +(min + Math.random() * (max - min)).toFixed(2);
}

// ── Sub-components ────────────────────────────────────────

function NodeStatusDot({ status }: { status: NodeStatus }) {
  const color =
    status === "ACTIVE" ? GREEN : status === "STANDBY" ? AMBER : RED;
  const isPulsing = status === "ACTIVE";
  return (
    <span className="relative inline-flex items-center justify-center w-2.5 h-2.5 mr-1 flex-shrink-0">
      {isPulsing && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-50"
          style={{ background: color }}
        />
      )}
      <span
        className="relative w-2 h-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 5px ${color}` }}
      />
    </span>
  );
}

function MiniBar({
  value,
  color = CYAN,
  height = 3,
}: {
  value: number;
  color?: string;
  height?: number;
}) {
  return (
    <div
      className="rounded-full overflow-hidden flex-1"
      style={{ background: "oklch(0.22 0.03 255)", height }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ background: color, height: "100%", borderRadius: 9999 }}
      />
    </div>
  );
}

// Tiny SVG sparkline
function Sparkline({
  data,
  target,
  color,
}: {
  data: number[];
  target: number;
  color: string;
}) {
  const W = 60;
  const H = 22;
  if (data.length < 2) return null;
  const min = Math.min(...data) * 0.9;
  const max = Math.max(...data) * 1.1;
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const targetY = H - ((target - min) / range) * H;

  return (
    <svg
      width={W}
      height={H}
      className="overflow-visible flex-shrink-0"
      role="img"
      aria-label="Latency sparkline"
    >
      {/* Target line */}
      <line
        x1="0"
        y1={targetY}
        x2={W}
        y2={targetY}
        stroke={AMBER}
        strokeWidth="0.5"
        strokeDasharray="2,2"
        opacity="0.6"
      />
      {/* Sparkline path */}
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      {/* Last point dot */}
      <circle
        cx={W}
        cy={Number.parseFloat(points[points.length - 1].split(",")[1])}
        r="1.5"
        fill={color}
      />
    </svg>
  );
}

// Circular readiness gauge
function ReadinessGauge({ score }: { score: number }) {
  const R = 28;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - score / 100);
  const color = score > 80 ? GREEN : score >= 60 ? AMBER : RED;
  const label = score > 80 ? "READY" : score >= 60 ? "PARTIAL" : "DEGRADED";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width="72"
        height="72"
        className="-rotate-90"
        role="img"
        aria-label={`Readiness gauge: ${score}`}
      >
        {/* Track */}
        <circle
          cx="36"
          cy="36"
          r={R}
          fill="none"
          stroke="oklch(0.22 0.03 255)"
          strokeWidth="5"
        />
        {/* Progress */}
        <motion.circle
          cx="36"
          cy="36"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <div className="flex flex-col items-center -mt-14">
        <span
          className="text-lg font-mono-code font-bold leading-none"
          style={{ color }}
        >
          {Math.round(score)}
        </span>
        <span
          className="text-[9px] font-mono-code font-bold tracking-widest"
          style={{ color }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// Signal bars
function SignalBars({ level }: { level: number }) {
  return (
    <div className="flex items-end gap-0.5">
      {[1, 2, 3, 4, 5].map((bar) => (
        <motion.div
          key={bar}
          animate={{
            background: bar <= level ? CYAN : "oklch(0.28 0.03 255)",
            boxShadow: bar <= level ? `0 0 4px ${CYAN}` : "none",
          }}
          transition={{ duration: 0.3, delay: (bar - 1) * 0.04 }}
          style={{
            height: `${6 + bar * 3}px`,
            width: "4px",
            borderRadius: "1px",
          }}
        />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
import * as React from "react";

// ── Compliance Badge ──────────────────────────────────────────
function ComplianceBadge6G() {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono-code font-bold"
      style={{
        background: "oklch(0.65 0.16 150 / 0.12)",
        border: "1px solid oklch(0.65 0.16 150 / 0.3)",
        color: "oklch(0.65 0.16 150)",
      }}
    >
      ✓ 262626
    </span>
  );
}

// ── Sovereign Lane Panel ──────────────────────────────────────
function SovereignLanePanel() {
  const [packets, setPackets] = React.useState(48291);
  React.useEffect(() => {
    const t = setInterval(
      () => setPackets((p) => p + Math.floor(Math.random() * 12 + 4)),
      500,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <div
      className="mx-3 mt-3 rounded-xl overflow-hidden"
      style={{ border: `1px solid ${CYAN_BORDER}`, background: CARD_BG }}
    >
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{ borderColor: "oklch(0.22 0.025 255)" }}
      >
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4" style={{ color: CYAN }} />
          <div>
            <p
              className="text-xs font-display font-bold"
              style={{ color: CYAN }}
            >
              SOVEREIGN LANE — FINANCIAL DATA ISOLATION
            </p>
            <p
              className="text-[9px] font-mono-code"
              style={{ color: "oklch(0.5 0.08 200)" }}
            >
              Hard-partitioned · Sub-ms latency · DEMO
            </p>
          </div>
        </div>
        <ComplianceBadge6G />
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {[
          { label: "Lane Status", value: "ACTIVE / ISOLATED", color: GREEN },
          { label: "Bandwidth", value: "2.4 Gbps dedicated", color: CYAN },
          { label: "Isolation Mode", value: "HARD-PARTITIONED", color: AMBER },
          { label: "Latency Target", value: "0.18ms", color: CYAN },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-lg px-2.5 py-2"
            style={{
              background: "oklch(0.16 0.022 255)",
              border: "1px solid oklch(0.24 0.028 255)",
            }}
          >
            <p
              className="text-[9px] font-body"
              style={{ color: "oklch(0.5 0.04 255)" }}
            >
              {label}
            </p>
            <p
              className="text-[10px] font-mono-code font-bold"
              style={{ color }}
            >
              {value}
            </p>
          </div>
        ))}
        <div
          className="col-span-2 rounded-lg px-2.5 py-2 flex items-center justify-between"
          style={{
            background: "oklch(0.16 0.022 255)",
            border: "1px solid oklch(0.24 0.028 255)",
          }}
        >
          <div>
            <p
              className="text-[9px] font-body"
              style={{ color: "oklch(0.5 0.04 255)" }}
            >
              Financial Packets / sec
            </p>
            <p
              className="text-sm font-mono-code font-bold"
              style={{ color: CYAN }}
            >
              {packets.toLocaleString()}
            </p>
          </div>
          <div
            className="text-[9px] font-mono-code px-2 py-1 rounded"
            style={{
              background: "oklch(0.65 0.22 15 / 0.12)",
              border: "1px solid oklch(0.65 0.22 15 / 0.3)",
              color: "oklch(0.75 0.18 18)",
            }}
          >
            GENERAL TRAFFIC BLOCKED
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Network Slicing Panel ─────────────────────────────────────
const SLICES = [
  {
    id: "eMBB-001",
    name: "eMBB",
    desc: "Enhanced Mobile Broadband",
    type: "General traffic",
    util: 67,
    latencyTarget: "1ms",
    currentLatency: "0.82ms",
    gold: false,
  },
  {
    id: "URLLC-SOV-001",
    name: "URLLC",
    desc: "Ultra-Reliable Low Latency",
    type: "SOVEREIGN FINANCIAL",
    util: 23,
    latencyTarget: "0.1ms",
    currentLatency: "0.07ms",
    gold: true,
  },
  {
    id: "mMTC-IOT-001",
    name: "mMTC",
    desc: "Massive Machine Type",
    type: "IoT Sensors",
    util: 41,
    latencyTarget: "2ms",
    currentLatency: "1.14ms",
    gold: false,
  },
];

function NetworkSlicingPanel() {
  return (
    <div
      className="mx-3 mt-3 rounded-xl overflow-hidden"
      style={{
        border: "1px solid oklch(0.72 0.16 55 / 0.4)",
        background: "oklch(0.10 0.015 55 / 0.2)",
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{ borderColor: "oklch(0.22 0.025 255)" }}
      >
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4" style={{ color: AMBER }} />
          <div>
            <p
              className="text-xs font-display font-bold"
              style={{ color: AMBER }}
            >
              NETWORK SLICING — 5G/6G SLICE ASSIGNMENT
            </p>
            <p
              className="text-[9px] font-mono-code"
              style={{ color: "oklch(0.5 0.08 55)" }}
            >
              3GPP NR Slice Isolation · DEMO
            </p>
          </div>
        </div>
        <ComplianceBadge6G />
      </div>
      <div className="p-3 space-y-2.5">
        {SLICES.map((slice) => (
          <div
            key={slice.id}
            className="rounded-lg px-3 py-2.5"
            style={{
              background: slice.gold
                ? "oklch(0.72 0.16 55 / 0.08)"
                : "oklch(0.14 0.022 255)",
              border: slice.gold
                ? "1px solid oklch(0.72 0.16 55 / 0.35)"
                : "1px solid oklch(0.24 0.028 255)",
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-mono-code font-bold"
                    style={{ color: slice.gold ? AMBER : CYAN }}
                  >
                    {slice.name}
                  </span>
                  <span
                    className="text-[9px] font-body"
                    style={{ color: "oklch(0.6 0.04 255)" }}
                  >
                    {slice.desc}
                  </span>
                  {slice.gold && (
                    <span
                      className="text-[8px] font-mono-code px-1 py-0.5 rounded"
                      style={{
                        background: "oklch(0.72 0.16 55 / 0.15)",
                        color: AMBER,
                        border: "1px solid oklch(0.72 0.16 55 / 0.3)",
                      }}
                    >
                      SOVEREIGN
                    </span>
                  )}
                </div>
                <p
                  className="text-[8px] font-mono-code mt-0.5"
                  style={{ color: "oklch(0.45 0.04 255)" }}
                >
                  ID: {slice.id} · Target: {slice.latencyTarget} · Now:{" "}
                  {slice.currentLatency}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-sm font-mono-code font-bold"
                  style={{ color: slice.gold ? AMBER : CYAN }}
                >
                  {slice.util}%
                </p>
                <p
                  className="text-[8px] font-body"
                  style={{ color: "oklch(0.45 0.04 255)" }}
                >
                  {slice.type}
                </p>
              </div>
            </div>
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: 4, background: "oklch(0.22 0.025 255)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${slice.util}%`,
                  background: slice.gold ? AMBER : CYAN,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SixGPage({
  inactionActive = false,
}: {
  inactionActive?: boolean;
}) {
  const logSensorEvent = useLogSensorEvent();

  // Signal & frequency
  const [signalLevel, setSignalLevel] = useState(4);
  const [freqBand, setFreqBand] = useState<FreqBand>("sub-6GHz");
  const [latencyMs, setLatencyMs] = useState(0.8);

  // Edge nodes
  const [nodes, setNodes] = useState<EdgeNode[]>(INITIAL_NODES);

  // Quantum key
  const [quantumKey, setQuantumKey] = useState(generateKey());
  const [keyAge, setKeyAge] = useState(0);

  // Latency channels
  const [channels, setChannels] = useState<LatencyChannel[]>([
    {
      id: "banking",
      label: "Banking",
      targetMs: 1.0,
      history: Array.from({ length: 12 }, () => randLatency(0.5, 1.0)),
      current: 0.7,
    },
    {
      id: "vault",
      label: "Vault Sync",
      targetMs: 2.0,
      history: Array.from({ length: 12 }, () => randLatency(1.0, 2.0)),
      current: 1.4,
    },
    {
      id: "ai",
      label: "AI Inference",
      targetMs: 5.0,
      history: Array.from({ length: 12 }, () => randLatency(2.0, 5.0)),
      current: 3.2,
    },
  ]);

  // Network slices
  const [slices, setSlices] = useState([
    {
      id: "embb",
      label: "eMBB",
      desc: "Enhanced Mobile Broadband",
      active: true,
      bandwidth: 72,
      priority: "HIGH",
    },
    {
      id: "urllc",
      label: "URLLC",
      desc: "Ultra-Reliable Low Latency",
      active: true,
      bandwidth: 48,
      priority: "HIGH",
    },
    {
      id: "mmtc",
      label: "mMTC",
      desc: "Massive IoT",
      active: true,
      bandwidth: 35,
      priority: "MED",
    },
  ]);

  // Readiness score
  const computeScore = useCallback(() => {
    const nodeHealth =
      nodes.reduce(
        (sum, n) =>
          sum + (n.status === "ACTIVE" ? 100 : n.status === "STANDBY" ? 60 : 0),
        0,
      ) / nodes.length;
    const latencyCompliance =
      (channels.filter((c) => c.current <= c.targetMs).length /
        channels.length) *
      100;
    const keyIntegrity = 100;
    return Math.round(
      nodeHealth * 0.5 + latencyCompliance * 0.35 + keyIntegrity * 0.15,
    );
  }, [nodes, channels]);

  const [score, setScore] = useState(computeScore);

  // ── Ticker: signal fluctuation ─────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      setSignalLevel((prev) => {
        const delta = Math.random() < 0.15 ? (Math.random() < 0.5 ? -1 : 1) : 0;
        return Math.max(1, Math.min(5, prev + delta));
      });
      setLatencyMs((prev) => +fluctuate(prev, 0.6, 1.4).toFixed(2));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  // ── Ticker: frequency band toggle ─────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      setFreqBand((f) => (f === "sub-6GHz" ? "mmWave" : "sub-6GHz"));
    }, 8000);
    return () => clearInterval(t);
  }, []);

  // ── Ticker: edge node refresh ──────────────────────────
  const logMutate = logSensorEvent.mutate;
  useEffect(() => {
    const t = setInterval(() => {
      setNodes((prev) =>
        prev.map((n) => {
          const loadDelta = (Math.random() - 0.5) * 10;
          const latDelta = (Math.random() - 0.5) * 2;
          return {
            ...n,
            loadPct: Math.max(5, Math.min(98, n.loadPct + loadDelta)),
            latencyMs: Math.max(
              1,
              Math.min(12, +(n.latencyMs + latDelta).toFixed(1)),
            ),
          };
        }),
      );
      logMutate({ eventType: "6G", value: "edge_node_refresh" });
    }, 3000);
    return () => clearInterval(t);
  }, [logMutate]);

  // ── Ticker: quantum key rotation ──────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      setQuantumKey(generateKey());
      setKeyAge(0);
    }, 10000);
    const ageT = setInterval(() => {
      setKeyAge((a) => a + 1);
    }, 1000);
    return () => {
      clearInterval(t);
      clearInterval(ageT);
    };
  }, []);

  // ── Ticker: latency channels ───────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      setChannels((prev) =>
        prev.map((ch) => {
          const spike = Math.random() < 0.08;
          const newVal = spike
            ? +(ch.targetMs * (1.3 + Math.random() * 0.5)).toFixed(2)
            : +randLatency(ch.targetMs * 0.5, ch.targetMs * 0.95).toFixed(2);
          return {
            ...ch,
            current: newVal,
            history: [...ch.history.slice(1), newVal],
          };
        }),
      );
    }, 2000);
    return () => clearInterval(t);
  }, []);

  // ── Recompute score when deps change ──────────────────
  useEffect(() => {
    setScore(computeScore());
  }, [computeScore]);

  // ── Handlers ──────────────────────────────────────────
  const handleRotateKey = () => {
    if (inactionActive) return;
    setQuantumKey(generateKey());
    setKeyAge(0);
    toast.success("Quantum key rotated", {
      icon: <Key className="w-3.5 h-3.5" style={{ color: CYAN }} />,
    });
    logSensorEvent.mutate({ eventType: "6G", value: "quantum_key_rotated" });
  };

  const handleSliceToggle = (idx: number) => {
    if (inactionActive) return;
    setSlices((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, active: !s.active } : s)),
    );
    logSensorEvent.mutate({ eventType: "6G", value: "slice_toggle" });
  };

  const nodeStatusColor = (s: NodeStatus) =>
    s === "ACTIVE" ? GREEN : s === "STANDBY" ? AMBER : RED;

  const loadColor = (pct: number) =>
    pct >= 80 ? RED : pct >= 60 ? AMBER : CYAN;

  const truncKey = `${quantumKey.slice(0, 24)}…${quantumKey.slice(-8)}`;

  const sliceBadgeColor = (priority: string) =>
    priority === "HIGH" ? CYAN : priority === "MED" ? AMBER : BLUE;

  const sliceAccentColor = (id: string) =>
    id === "embb" ? GREEN : id === "urllc" ? CYAN : BLUE;

  return (
    <div className="pb-4">
      {/* Inaction Safety Banner */}
      {inactionActive && (
        <div
          className="flex items-center gap-2 px-3 py-2 text-[10px] font-mono-code font-bold uppercase tracking-widest"
          style={{
            background: "oklch(0.13 0.03 20 / 0.9)",
            borderBottom: "1px solid oklch(0.62 0.2 18 / 0.4)",
            color: "oklch(0.75 0.18 18)",
          }}
        >
          <OctagonX className="w-3 h-3 flex-shrink-0" />
          Inaction Safety engaged — 6G actions locked
        </div>
      )}

      {/* ManageEngine PAM360 Deep-Link Telemetry */}
      <PAM360Telemetry />

      {/* ── Hero Header ────────────────────────── */}
      <div
        className="mx-3 mt-3 rounded-2xl p-3 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.04 200) 0%, oklch(0.11 0.025 220) 60%, oklch(0.14 0.035 185) 100%)",
          border: `1px solid ${CYAN_BORDER}`,
          boxShadow: "inset 0 0 40px oklch(0.7 0.15 195 / 0.05)",
        }}
      >
        {/* Decorative glow blobs */}
        <div
          className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none opacity-25"
          style={{
            background: `radial-gradient(circle, ${CYAN}, transparent 70%)`,
          }}
        />
        <div
          className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full pointer-events-none opacity-10"
          style={{
            background: `radial-gradient(circle, ${BLUE}, transparent 70%)`,
          }}
        />

        <div className="relative z-10 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: CYAN_DIM,
                border: `1px solid ${CYAN_BORDER}`,
              }}
            >
              <Radio className="w-4.5 h-4.5" style={{ color: CYAN }} />
            </div>
            <div>
              <p
                className="font-display font-bold text-sm text-foreground leading-tight"
                data-ocid="sixg.section"
              >
                6G Network
              </p>
              <p className="text-[10px] text-muted-foreground font-body">
                Moira Edge Infrastructure
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <Badge
              className="text-[9px] font-mono-code px-1.5 py-0.5 border-0 flex items-center gap-1"
              style={{
                background: "oklch(0.65 0.16 150 / 0.15)",
                color: GREEN,
              }}
            >
              <CheckCircle2 className="w-2.5 h-2.5" />
              6G READY
            </Badge>
            <div className="flex items-center gap-1.5">
              <SignalBars level={signalLevel} />
              <motion.span
                key={freqBand}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[9px] font-mono-code font-bold"
                style={{ color: CYAN }}
              >
                {freqBand}
              </motion.span>
            </div>
          </div>
        </div>

        {/* Network slice status row */}
        <div className="relative z-10 flex items-center gap-1.5 mt-2.5">
          {[
            { label: "eMBB", color: GREEN },
            { label: "URLLC", color: CYAN },
            { label: "mMTC", color: BLUE },
          ].map(({ label, color }) => (
            <span
              key={label}
              className="text-[9px] font-mono-code font-bold px-1.5 py-0.5 rounded-md"
              style={{
                background: `${color.replace(")", " / 0.15)")}`,
                border: `1px solid ${color.replace(")", " / 0.3)")}`,
                color,
              }}
            >
              {label}
            </span>
          ))}
          <div className="flex-1" />
          <span className="text-[9px] font-mono-code" style={{ color: CYAN }}>
            {latencyMs}ms
          </span>
        </div>
      </div>

      {/* ── 6G Readiness Score + Signal ────────── */}
      <div className="mx-3 mt-3 flex gap-2">
        {/* Readiness gauge card */}
        <div
          className="flex-1 rounded-xl p-3 flex flex-col items-center justify-center gap-1"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          data-ocid="sixg.readiness.card"
        >
          <p className="text-[9px] font-mono-code text-muted-foreground uppercase tracking-wider mb-1">
            Readiness
          </p>
          <ReadinessGauge score={score} />
        </div>

        {/* Signal & Latency card */}
        <div
          className="flex-1 rounded-xl p-3 flex flex-col gap-2"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          data-ocid="sixg.signal.card"
        >
          <p className="text-[9px] font-mono-code text-muted-foreground uppercase tracking-wider">
            Signal
          </p>
          <div className="flex items-center gap-2">
            <SignalBars level={signalLevel} />
            <span className="text-[10px] font-mono-code font-bold text-foreground/80">
              S{signalLevel}/5
            </span>
          </div>
          <div
            className="h-px"
            style={{ background: "oklch(0.22 0.025 255)" }}
          />
          <div className="flex flex-col gap-1">
            <p className="text-[9px] font-mono-code text-muted-foreground uppercase tracking-wider">
              Live Latency
            </p>
            <motion.span
              key={latencyMs}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              className="text-base font-mono-code font-bold leading-none"
              style={{ color: CYAN, filter: `drop-shadow(0 0 6px ${CYAN})` }}
            >
              {latencyMs}ms
            </motion.span>
            <span className="text-[9px] font-mono-code text-muted-foreground">
              target ~0.8ms
            </span>
          </div>
        </div>
      </div>

      {/* ── Edge Node Grid ──────────────────────── */}
      <div className="mx-3 mt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Satellite
            className="w-3 h-3 flex-shrink-0"
            style={{ color: CYAN }}
          />
          <p className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-widest">
            Edge Nodes
          </p>
          <div className="flex-1" />
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="flex items-center gap-1"
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: CYAN }}
            />
            <span className="text-[9px] font-mono-code" style={{ color: CYAN }}>
              Live
            </span>
          </motion.div>
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          data-ocid="sixg.nodes.table"
        >
          {/* Table header */}
          <div
            className="grid grid-cols-[1fr_40px_32px_40px] gap-1 px-3 py-1.5 text-[9px] font-mono-code text-muted-foreground uppercase tracking-wider"
            style={{
              background: SURFACE_BG,
              borderBottom: "1px solid oklch(0.22 0.025 255)",
            }}
          >
            <span>Node</span>
            <span className="text-right">Lat</span>
            <span className="text-right">Load</span>
            <span className="text-right">State</span>
          </div>

          {nodes.map((node, idx) => (
            <div
              key={node.id}
              className="grid grid-cols-[1fr_40px_32px_40px] gap-1 items-center px-3 py-2 border-b last:border-0"
              style={{ borderColor: "oklch(0.20 0.022 255)" }}
              data-ocid={`sixg.node.row.${idx + 1}`}
            >
              <div className="flex items-center gap-1 min-w-0">
                <NodeStatusDot status={node.status} />
                <span className="text-[10px] font-mono-code text-foreground/80 truncate">
                  {node.label}
                </span>
              </div>
              <span
                className="text-[10px] font-mono-code text-right"
                style={{
                  color:
                    node.latencyMs <= 5
                      ? GREEN
                      : node.latencyMs <= 9
                        ? AMBER
                        : RED,
                }}
              >
                {node.latencyMs.toFixed(1)}ms
              </span>
              {/* Load bar */}
              <div className="flex items-center">
                <MiniBar
                  value={node.loadPct}
                  color={loadColor(node.loadPct)}
                  height={4}
                />
              </div>
              <span
                className="text-[9px] font-mono-code text-right"
                style={{ color: nodeStatusColor(node.status) }}
              >
                {node.status === "ACTIVE"
                  ? "ACT"
                  : node.status === "STANDBY"
                    ? "SBY"
                    : "FLT"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quantum-Safe Key Panel ──────────────── */}
      <div className="mx-3 mt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Key className="w-3 h-3 flex-shrink-0" style={{ color: CYAN }} />
          <p className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-widest">
            Quantum-Safe Key
          </p>
        </div>

        <div
          className="rounded-xl p-3"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          data-ocid="sixg.quantum.card"
        >
          {/* Algorithm badge */}
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] font-mono-code font-bold px-2 py-0.5 rounded-md"
              style={{
                background: CYAN_DIM,
                border: `1px solid ${CYAN_BORDER}`,
                color: CYAN,
              }}
            >
              CRYSTALS-Kyber-1024
            </span>
            <span
              className="flex items-center gap-1 text-[9px] font-mono-code"
              style={{ color: GREEN }}
            >
              <CheckCircle2 className="w-2.5 h-2.5" />
              VERIFIED
            </span>
          </div>

          {/* Key display */}
          <div
            className="rounded-md px-2 py-2 mb-2 font-mono-code text-[9px] break-all select-all"
            style={{
              background: SURFACE_BG,
              border: "1px solid oklch(0.22 0.025 255)",
              color: "oklch(0.7 0.15 195)",
              lineHeight: "1.5",
            }}
          >
            {truncKey}
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono-code text-muted-foreground">
              Age: {keyAge}s · 256-bit · Lattice-based
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRotateKey}
              disabled={inactionActive}
              className="h-6 text-[9px] px-2 font-mono-code gap-1 disabled:opacity-40"
              style={{
                background: CYAN_DIM,
                border: `1px solid ${CYAN_BORDER}`,
                color: CYAN,
              }}
              data-ocid="sixg.rotate_key.button"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              Rotate Key
            </Button>
          </div>
        </div>
      </div>

      {/* ── Ultra-Low Latency Monitor ───────────── */}
      <div className="mx-3 mt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Activity className="w-3 h-3 flex-shrink-0" style={{ color: CYAN }} />
          <p className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-widest">
            Latency Monitor
          </p>
        </div>

        <div
          className="rounded-xl overflow-hidden divide-y"
          style={
            {
              background: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
              "--divide-color": "oklch(0.20 0.022 255)",
            } as React.CSSProperties
          }
          data-ocid="sixg.latency.card"
        >
          {channels.map((ch, idx) => {
            const isBreached = ch.current > ch.targetMs;
            const chColor =
              ch.id === "banking" ? GREEN : ch.id === "vault" ? CYAN : BLUE;

            return (
              <div
                key={ch.id}
                className="flex items-center gap-2 px-3 py-2"
                style={{ borderColor: "oklch(0.20 0.022 255)" }}
                data-ocid={`sixg.channel.row.${idx + 1}`}
              >
                {/* Label + target */}
                <div className="w-20 flex-shrink-0">
                  <p className="text-[10px] font-mono-code text-foreground/80 leading-tight">
                    {ch.label}
                  </p>
                  <p className="text-[9px] font-mono-code text-muted-foreground leading-tight">
                    tgt &lt;{ch.targetMs}ms
                  </p>
                </div>

                {/* Sparkline */}
                <Sparkline
                  data={ch.history}
                  target={ch.targetMs}
                  color={chColor}
                />

                {/* Current value */}
                <div className="flex flex-col items-end ml-auto flex-shrink-0">
                  <motion.span
                    key={ch.current}
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    className="text-[11px] font-mono-code font-bold leading-tight"
                    style={{ color: isBreached ? AMBER : chColor }}
                  >
                    {ch.current.toFixed(2)}ms
                  </motion.span>
                  {isBreached && (
                    <span
                      className="text-[8px] font-mono-code font-bold flex items-center gap-0.5"
                      style={{ color: AMBER }}
                    >
                      <AlertTriangle className="w-2 h-2" />
                      THRESHOLD
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Network Slice Manager ───────────────── */}
      <div className="mx-3 mt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Network className="w-3 h-3 flex-shrink-0" style={{ color: CYAN }} />
          <p className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-widest">
            Network Slices
          </p>
        </div>

        <div className="space-y-1.5">
          {slices.map((slice, idx) => {
            const accent = sliceAccentColor(slice.id);
            const priorityColor = sliceBadgeColor(slice.priority);

            return (
              <div
                key={slice.id}
                className="rounded-xl p-3"
                style={{
                  background: CARD_BG,
                  border: `1px solid ${slice.active ? accent.replace(")", " / 0.25)") : CARD_BORDER}`,
                  transition: "border-color 0.3s ease",
                }}
                data-ocid={`sixg.slice.card.${idx + 1}`}
              >
                <div className="flex items-center gap-2">
                  {/* Status indicator */}
                  {slice.active && (
                    <motion.div
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{
                        duration: 2.2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: accent }}
                    />
                  )}
                  {!slice.active && (
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-30"
                      style={{ background: accent }}
                    />
                  )}

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[10px] font-mono-code font-bold"
                        style={{
                          color: slice.active ? accent : "oklch(0.5 0.04 255)",
                        }}
                      >
                        {slice.label}
                      </span>
                      <span
                        className="text-[8px] font-mono-code font-bold px-1 py-px rounded"
                        style={{
                          background: `${priorityColor.replace(")", " / 0.12)")}`,
                          color: priorityColor,
                          border: `1px solid ${priorityColor.replace(")", " / 0.3)")}`,
                        }}
                      >
                        {slice.priority}
                      </span>
                    </div>
                    <p className="text-[9px] text-muted-foreground font-body truncate">
                      {slice.desc}
                    </p>
                  </div>

                  {/* Bandwidth display */}
                  <div className="flex flex-col items-end mr-2 flex-shrink-0">
                    <span
                      className="text-[10px] font-mono-code font-bold"
                      style={{
                        color: slice.active ? accent : "oklch(0.4 0.03 255)",
                      }}
                    >
                      {slice.bandwidth}%
                    </span>
                    <span className="text-[8px] font-mono-code text-muted-foreground">
                      BW alloc
                    </span>
                  </div>

                  {/* Toggle switch */}
                  <Switch
                    checked={slice.active}
                    onCheckedChange={() => handleSliceToggle(idx)}
                    disabled={inactionActive}
                    data-ocid={`sixg.slice.switch.${idx + 1}`}
                    className="flex-shrink-0 data-[state=checked]:bg-cyan-accent disabled:opacity-40"
                    style={
                      {
                        "--switch-checked-bg": accent,
                      } as React.CSSProperties
                    }
                  />
                </div>

                {/* Bandwidth bar */}
                <div className="mt-2 flex items-center gap-1.5">
                  <MiniBar
                    value={slice.active ? slice.bandwidth : 0}
                    color={slice.active ? accent : "oklch(0.28 0.03 255)"}
                    height={3}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Sovereign Lane — Financial Data Isolation ──────── */}
      <SovereignLanePanel />

      {/* ── Network Slicing — 5G/6G Slice Assignment ────────── */}
      <NetworkSlicingPanel />

      {/* ── 6G Compliance Footer ─────────────────── */}
      <div className="mx-3 mt-3 mb-2">
        <div
          className="rounded-xl p-3 flex items-center gap-2"
          style={{
            background: SURFACE_BG,
            border: "1px solid oklch(0.22 0.025 255)",
          }}
        >
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Lock className="w-3 h-3 flex-shrink-0" style={{ color: CYAN }} />
            <div className="min-w-0">
              <p className="text-[9px] font-mono-code text-foreground/60 leading-tight truncate">
                ITU-R IMT-2030 · 3GPP Rel-20 · NIST PQC
              </p>
              <p className="text-[9px] font-mono-code text-muted-foreground leading-tight">
                Quantum-resistant transport active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Shield className="w-3 h-3" style={{ color: GREEN }} />
            <span
              className="text-[9px] font-mono-code font-bold"
              style={{ color: GREEN }}
            >
              SECURE
            </span>
          </div>
        </div>
      </div>

      {/* Inaction locked overlay indicator */}
      {inactionActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-3 mb-2"
        >
          <div
            className="rounded-xl p-2 flex items-center gap-2 text-[10px] font-mono-code font-bold"
            style={{
              background: "oklch(0.14 0.03 20 / 0.6)",
              border: "1px solid oklch(0.62 0.2 18 / 0.4)",
              color: "oklch(0.75 0.18 18)",
            }}
            data-ocid="sixg.loading_state"
          >
            <OctagonX className="w-3 h-3" />
            6G controls locked — disengage Inaction Safety to interact
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <div className="text-center pb-2 mt-2">
        <p className="text-[10px] text-muted-foreground font-body">
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-gold">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>

      {/* Sovereign Licensing Footer */}
      <div
        className="text-center py-3 mx-3 border-t"
        style={{ borderColor: "oklch(0.22 0.025 255)" }}
      >
        <p
          className="text-[9px] font-mono-code"
          style={{ color: "oklch(0.4 0.04 255)" }}
        >
          © P.S. Thimaia · CC BY-NC-ND · MOIRA SmartBank AI
        </p>
      </div>
    </div>
  );
}
