import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// ── Amber color constants ─────────────────────────────────────
const C_AMBER = "oklch(0.78 0.16 75)";
const C_AMBER_DIM = "oklch(0.55 0.12 75)";
const C_AMBER_BG = "oklch(0.78 0.16 75 / 0.10)";
const C_AMBER_BORDER = "oklch(0.78 0.16 75 / 0.35)";
const C_DARK = "oklch(0.09 0.018 75)";
const C_CARD = "oklch(0.12 0.022 75 / 0.5)";
const C_GREEN = "oklch(0.65 0.16 150)";
const C_RED = "oklch(0.65 0.22 15)";

function nowTs() {
  return new Date().toTimeString().slice(0, 8);
}

function ComplianceBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold"
      style={{
        background: "oklch(0.65 0.16 150 / 0.12)",
        border: "1px solid oklch(0.65 0.16 150 / 0.3)",
        color: C_GREEN,
      }}
    >
      ✓ 262626
    </span>
  );
}

// ── Animated voltage waveform ─────────────────────────────────
function VoltageWaveform({ status }: { status: "STABLE" | "ELEVATED" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = "oklch(0.78 0.16 75 / 0.08)";
      ctx.lineWidth = 0.5;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (H / 4) * i);
        ctx.lineTo(W, (H / 4) * i);
        ctx.stroke();
      }

      // Main sine wave
      const amp = status === "ELEVATED" ? H * 0.38 : H * 0.28;
      const freq = status === "ELEVATED" ? 2.2 : 1.8;
      ctx.beginPath();
      ctx.strokeStyle =
        status === "ELEVATED" ? "oklch(0.85 0.18 40)" : "oklch(0.78 0.16 75)";
      ctx.lineWidth = 2;
      ctx.shadowColor =
        status === "ELEVATED"
          ? "oklch(0.85 0.18 40 / 0.6)"
          : "oklch(0.78 0.16 75 / 0.5)";
      ctx.shadowBlur = 6;
      for (let x = 0; x < W; x++) {
        const y =
          H / 2 +
          Math.sin((x / W) * Math.PI * 2 * freq + phaseRef.current) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Glow secondary
      ctx.beginPath();
      ctx.strokeStyle = "oklch(0.78 0.16 75 / 0.2)";
      ctx.lineWidth = 5;
      ctx.shadowBlur = 0;
      for (let x = 0; x < W; x++) {
        const y =
          H / 2 +
          Math.sin((x / W) * Math.PI * 2 * freq + phaseRef.current) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phaseRef.current += 0.04;
      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [status]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={60}
      className="w-full h-[60px] rounded-lg"
      style={{ background: C_DARK }}
    />
  );
}

// ── Mini bar chart ────────────────────────────────────────────
const CHART_KEYS = ["t-4", "t-3", "t-2", "t-1", "now"];
function ThreatMiniChart({ values }: { values: number[] }) {
  const max = 100;
  return (
    <div className="flex items-end gap-1 h-8">
      {values.map((v, i) => (
        <div
          key={CHART_KEYS[i] ?? String(i)}
          className="flex-1 rounded-sm transition-all duration-700"
          style={{
            height: `${(v / max) * 100}%`,
            background:
              v > 60 ? "oklch(0.65 0.22 15 / 0.8)" : v > 30 ? C_AMBER : C_GREEN,
            boxShadow: v > 60 ? "0 0 4px oklch(0.65 0.22 15 / 0.5)" : undefined,
          }}
        />
      ))}
    </div>
  );
}

// ── Metric bar ────────────────────────────────────────────────
function MetricBar({ label, value }: { label: string; value: number }) {
  const color = value > 60 ? C_RED : value > 30 ? C_AMBER : C_GREEN;
  return (
    <div className="mb-2.5">
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-[9px] font-mono uppercase tracking-wider"
          style={{ color: "oklch(0.55 0.06 75)" }}
        >
          {label}
        </span>
        <span className="text-[10px] font-mono font-bold" style={{ color }}>
          {value.toFixed(1)}%
        </span>
      </div>
      <div
        className="relative w-full h-2 rounded-full overflow-hidden"
        style={{ background: "oklch(0.16 0.025 75)" }}
      >
        <motion.div
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: color,
            boxShadow: value > 60 ? `0 0 6px ${color}` : undefined,
          }}
        />
        {/* Threshold markers */}
        <div
          className="absolute inset-y-0 w-px"
          style={{ left: "30%", background: "oklch(0.4 0.08 75 / 0.6)" }}
        />
        <div
          className="absolute inset-y-0 w-px"
          style={{ left: "60%", background: "oklch(0.4 0.08 75 / 0.6)" }}
        />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export default function AVEVAPredictiveLayer() {
  // Engine status cycle
  const [engineStatus, setEngineStatus] = useState<
    "ONLINE" | "CALIBRATING" | "ALERT"
  >("ONLINE");
  useEffect(() => {
    const states: ("ONLINE" | "CALIBRATING" | "ALERT")[] = [
      "ONLINE",
      "ONLINE",
      "ONLINE",
      "CALIBRATING",
      "ONLINE",
    ];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % states.length;
      setEngineStatus(states[i]);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  // ── Panel 1: Threat Prediction ────────────────────────────
  const [horizon, setHorizon] = useState<"15MIN" | "1HR" | "24HR">("15MIN");
  const horizonValues = {
    "15MIN": { base: 12.4, drift: 2 },
    "1HR": { base: 24.7, drift: 4 },
    "24HR": { base: 38.2, drift: 8 },
  };
  const [threatPct, setThreatPct] = useState(12.4);
  const [chartBars, setChartBars] = useState([8, 11, 14, 10, 12]);

  useEffect(() => {
    const { base, drift } = horizonValues[horizon];
    setThreatPct(base);
    const id = setInterval(() => {
      const delta = (Math.random() - 0.5) * drift;
      setThreatPct((prev) => Math.max(0, Math.min(99, prev + delta)));
      setChartBars((prev) => {
        const next = [
          ...prev.slice(1),
          Math.max(
            1,
            Math.min(
              99,
              prev[prev.length - 1] + (Math.random() - 0.5) * drift * 1.5,
            ),
          ),
        ];
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [horizon]);

  const riskColor = threatPct > 60 ? C_RED : threatPct > 25 ? C_AMBER : C_GREEN;
  const riskLabel =
    threatPct > 60 ? "HIGH RISK" : threatPct > 25 ? "MODERATE" : "LOW RISK";

  // ── Panel 2: Behavioral Sensibility ──────────────────────
  const [duress, setDuress] = useState(8.2);
  const [coercion, setCoercion] = useState(4.6);
  const [cognitive, setCognitive] = useState(11.3);
  const behaviorAlert = duress > 60 || coercion > 60 || cognitive > 60;

  useEffect(() => {
    const id = setInterval(() => {
      setDuress((p) =>
        Math.max(0, Math.min(99, p + (Math.random() - 0.5) * 3)),
      );
      setCoercion((p) =>
        Math.max(0, Math.min(99, p + (Math.random() - 0.5) * 2)),
      );
      setCognitive((p) =>
        Math.max(0, Math.min(99, p + (Math.random() - 0.5) * 2.5)),
      );
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // ── Panel 3: Industrial Mirror ────────────────────────────
  const [mirrorFidelity, setMirrorFidelity] = useState(97.8);
  const [lastSync, setLastSync] = useState(nowTs());
  const [heartbeat, setHeartbeat] = useState(false);

  useEffect(() => {
    const fidId = setInterval(() => {
      setMirrorFidelity(96.4 + Math.random() * 3.4);
      setLastSync(nowTs());
    }, 3000);
    const hbId = setInterval(() => {
      setHeartbeat(true);
      setTimeout(() => setHeartbeat(false), 400);
    }, 1400);
    return () => {
      clearInterval(fidId);
      clearInterval(hbId);
    };
  }, []);

  // ── Voltage corridor ─────────────────────────────────────
  const [txRate, setTxRate] = useState(2847);
  const [voltageStatus] = useState<"STABLE" | "ELEVATED">("STABLE");

  useEffect(() => {
    const id = setInterval(() => {
      setTxRate((p) =>
        Math.max(
          2200,
          Math.min(3800, p + Math.floor((Math.random() - 0.5) * 80)),
        ),
      );
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const engineColor =
    engineStatus === "ONLINE"
      ? C_AMBER
      : engineStatus === "CALIBRATING"
        ? "oklch(0.65 0.1 220)"
        : C_RED;

  return (
    <div
      className="mx-3 mt-3 rounded-xl overflow-hidden"
      style={{
        border: `1px solid ${C_AMBER_BORDER}`,
        background: C_CARD,
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-2.5 border-b"
        style={{ borderColor: "oklch(0.22 0.025 75 / 0.5)" }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              boxShadow: [
                `0 0 6px ${C_AMBER}/0.4`,
                `0 0 14px ${C_AMBER}/0.7`,
                `0 0 6px ${C_AMBER}/0.4`,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-base"
            style={{
              background: C_AMBER_BG,
              border: `1px solid ${C_AMBER_BORDER}`,
            }}
          >
            🏭
          </motion.div>
          <div>
            <p
              className="text-[11px] font-mono font-black tracking-widest uppercase"
              style={{ color: C_AMBER }}
            >
              AVEVA PREDICTIVE ENGINE — DIGITAL TWIN LAYER
            </p>
            <p className="text-[8px] font-mono" style={{ color: C_AMBER_DIM }}>
              Industrial-Grade Behavioral Prediction · [DEMO]
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ComplianceBadge />
          <motion.span
            animate={{
              opacity: engineStatus === "CALIBRATING" ? [1, 0.4, 1] : 1,
            }}
            transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
            className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-full"
            style={{
              background: `${engineColor}18`,
              border: `1px solid ${engineColor}50`,
              color: engineColor,
            }}
          >
            AVEVA {engineStatus}
          </motion.span>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* ══ PANEL 1: THREAT PREDICTION ══════════════════════ */}
        <div
          className="rounded-xl p-3"
          style={{
            background: "oklch(0.10 0.02 75)",
            border: `1px solid ${C_AMBER_BORDER}`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[10px] font-mono font-bold tracking-widest uppercase"
              style={{ color: C_AMBER }}
            >
              Threat Prediction Score
            </span>
            <div className="flex gap-1">
              {(["15MIN", "1HR", "24HR"] as const).map((h) => (
                <button
                  key={h}
                  type="button"
                  data-ocid={`aveva.threat.${h.toLowerCase().replace("/", "")}.tab`}
                  onClick={() => setHorizon(h)}
                  className="text-[8px] font-mono px-1.5 py-0.5 rounded transition-all"
                  style={{
                    background: horizon === h ? C_AMBER_BG : "transparent",
                    border: `1px solid ${horizon === h ? C_AMBER : "oklch(0.3 0.06 75)"}`,
                    color: horizon === h ? C_AMBER : "oklch(0.45 0.06 75)",
                  }}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <motion.div
              key={horizon}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-3xl font-mono font-black tabular-nums"
              style={{ color: riskColor, textShadow: `0 0 20px ${riskColor}` }}
            >
              {threatPct.toFixed(1)}%
            </motion.div>
            <div>
              <div
                className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full mb-1"
                style={{
                  background: `${riskColor}18`,
                  border: `1px solid ${riskColor}40`,
                  color: riskColor,
                }}
              >
                {riskLabel}
              </div>
              <div
                className="text-[8px] font-mono"
                style={{ color: C_AMBER_DIM }}
              >
                Breach probability · NEXT {horizon}
              </div>
            </div>
          </div>

          <ThreatMiniChart values={chartBars} />
          <div className="flex justify-between mt-1">
            {["T-4", "T-3", "T-2", "T-1", "NOW"].map((t) => (
              <span
                key={t}
                className="text-[7px] font-mono"
                style={{ color: "oklch(0.35 0.04 75)" }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ══ PANEL 2: BEHAVIORAL SENSIBILITY ═════════════════ */}
        <motion.div
          animate={
            behaviorAlert
              ? {
                  borderColor: [
                    C_AMBER_BORDER,
                    "oklch(0.65 0.22 15 / 0.6)",
                    C_AMBER_BORDER,
                  ],
                }
              : {}
          }
          transition={{
            duration: 0.8,
            repeat: behaviorAlert ? Number.POSITIVE_INFINITY : 0,
          }}
          className="rounded-xl p-3"
          style={{
            background: "oklch(0.10 0.02 75)",
            border: `1px solid ${C_AMBER_BORDER}`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[10px] font-mono font-bold tracking-widest uppercase"
              style={{ color: C_AMBER }}
            >
              Behavioral Sensibility Index
            </span>
            <AnimatePresence>
              {behaviorAlert && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [1, 0.5, 1] }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.6,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                  className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: "oklch(0.65 0.22 15 / 0.18)",
                    border: "1px solid oklch(0.65 0.22 15 / 0.5)",
                    color: C_RED,
                  }}
                >
                  ⚠ BEHAVIORAL ALERT
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <MetricBar label="Duress Detection Score" value={duress} />
          <MetricBar label="Coercion Probability" value={coercion} />
          <MetricBar label="Cognitive Decline Indicator" value={cognitive} />

          <div
            className="flex items-center gap-2 mt-2 px-2.5 py-1.5 rounded-lg"
            style={{
              background: "oklch(0.14 0.025 220 / 0.4)",
              border: "1px solid oklch(0.4 0.1 220 / 0.3)",
            }}
          >
            <span
              className="text-[8px] font-mono"
              style={{ color: "oklch(0.55 0.1 220)" }}
            >
              CROSS-REF:
            </span>
            <span
              className="text-[8px] font-mono font-bold"
              style={{ color: C_GREEN }}
            >
              BIO-SOVEREIGN ✓
            </span>
            <span
              className="text-[8px] font-mono font-bold"
              style={{ color: C_GREEN }}
            >
              DIGITAL SMILE ✓
            </span>
          </div>

          <AnimatePresence>
            {behaviorAlert && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 rounded-lg px-2.5 py-2 text-[9px] font-mono font-bold"
                style={{
                  background: "oklch(0.65 0.22 15 / 0.12)",
                  border: "1px solid oklch(0.65 0.22 15 / 0.4)",
                  color: C_RED,
                }}
              >
                ⚠ PARAMOUNT SECURITY ACTIVATED — Biometric + Behavioral anomaly
                detected simultaneously
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ══ PANEL 3: INDUSTRIAL MIRROR STATUS ═══════════════ */}
        <div
          className="rounded-xl p-3"
          style={{
            background: "oklch(0.10 0.02 75)",
            border: `1px solid ${C_AMBER_BORDER}`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[10px] font-mono font-bold tracking-widest uppercase"
              style={{ color: C_AMBER }}
            >
              Industrial Mirror Status
            </span>
            <div className="flex items-center gap-1.5">
              <motion.div
                animate={{
                  scale: heartbeat ? 1.4 : 1,
                  opacity: heartbeat ? 1 : 0.7,
                }}
                transition={{ duration: 0.15 }}
                className="w-2 h-2 rounded-full"
                style={{
                  background: C_GREEN,
                  boxShadow: heartbeat ? `0 0 8px ${C_GREEN}` : "none",
                }}
              />
              <span
                className="text-[8px] font-mono font-bold"
                style={{ color: C_GREEN }}
              >
                TWIN ACTIVE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div
              className="rounded-lg p-2"
              style={{
                background: "oklch(0.14 0.025 75)",
                border: `1px solid ${C_AMBER_BORDER}`,
              }}
            >
              <div
                className="text-[8px] font-mono uppercase tracking-widest mb-1"
                style={{ color: "oklch(0.45 0.08 75)" }}
              >
                Mirror Fidelity
              </div>
              <motion.div
                key={mirrorFidelity.toFixed(1)}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="text-lg font-mono font-black tabular-nums"
                style={{ color: C_AMBER }}
              >
                {mirrorFidelity.toFixed(1)}%
              </motion.div>
            </div>
            <div
              className="rounded-lg p-2"
              style={{
                background: "oklch(0.14 0.025 75)",
                border: `1px solid ${C_AMBER_BORDER}`,
              }}
            >
              <div
                className="text-[8px] font-mono uppercase tracking-widest mb-1"
                style={{ color: "oklch(0.45 0.08 75)" }}
              >
                Last Sync
              </div>
              <motion.div
                key={lastSync}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="text-[11px] font-mono font-bold tabular-nums"
                style={{ color: C_AMBER }}
              >
                {lastSync}
              </motion.div>
            </div>
          </div>

          {/* Sync quality bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-[8px] font-mono uppercase tracking-widest"
                style={{ color: "oklch(0.45 0.08 75)" }}
              >
                Sync Quality
              </span>
              <span
                className="text-[9px] font-mono font-bold"
                style={{ color: C_GREEN }}
              >
                EXCELLENT
              </span>
            </div>
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ background: "oklch(0.16 0.025 75)" }}
            >
              <motion.div
                animate={{ width: `${mirrorFidelity}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: C_GREEN, boxShadow: `0 0 6px ${C_GREEN}` }}
              />
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            {["NVIDIA-BACKED TWIN ENGINE", "ANDURIL STACK INTEGRATED"].map(
              (badge) => (
                <span
                  key={badge}
                  className="text-[7px] font-mono font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: C_AMBER_BG,
                    border: `1px solid ${C_AMBER_BORDER}`,
                    color: C_AMBER_DIM,
                  }}
                >
                  {badge}
                </span>
              ),
            )}
            <span
              className="text-[7px] font-mono font-bold px-2 py-0.5 rounded-full"
              style={{
                background: "oklch(0.14 0.025 220 / 0.4)",
                border: "1px solid oklch(0.4 0.1 220 / 0.3)",
                color: "oklch(0.55 0.12 220)",
              }}
            >
              M.SIM STRONG ROOM ↔ AVEVA TWIN
            </span>
          </div>
        </div>

        {/* ══ FLAT BANKING HIGH-VOLTAGE CORRIDOR ═══════════════ */}
        <div
          className="rounded-xl p-3"
          style={{ background: C_DARK, border: `1px solid ${C_AMBER_BORDER}` }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p
                className="text-[10px] font-mono font-bold uppercase tracking-widest"
                style={{ color: C_AMBER }}
              >
                AVEVA GOVERNING HIGH-VOLTAGE SETTLEMENT CORRIDOR
              </p>
              <p
                className="text-[8px] font-mono"
                style={{ color: C_AMBER_DIM }}
              >
                262.62 kV · Flat Banking Protocol · [DEMO]
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: `${C_GREEN}18`,
                  border: `1px solid ${C_GREEN}40`,
                  color: C_GREEN,
                }}
              >
                {voltageStatus}
              </span>
              <motion.span
                key={txRate}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                className="text-[9px] font-mono font-bold tabular-nums"
                style={{ color: C_AMBER }}
              >
                {txRate.toLocaleString()} tx/s
              </motion.span>
            </div>
          </div>
          <VoltageWaveform status={voltageStatus} />
        </div>
      </div>
    </div>
  );
}
