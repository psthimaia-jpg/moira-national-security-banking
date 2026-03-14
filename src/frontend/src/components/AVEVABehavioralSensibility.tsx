import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const C_AMBER = "oklch(0.78 0.16 75)";
const C_AMBER_DIM = "oklch(0.55 0.12 75)";
const C_AMBER_BG = "oklch(0.78 0.16 75 / 0.10)";
const C_AMBER_BORDER = "oklch(0.78 0.16 75 / 0.35)";
const C_DARK = "oklch(0.09 0.018 75)";
const C_GREEN = "oklch(0.65 0.16 150)";
const C_RED = "oklch(0.65 0.22 15)";

function MetricBar({ label, value }: { label: string; value: number }) {
  const color = value > 60 ? C_RED : value > 30 ? C_AMBER : C_GREEN;
  return (
    <div className="mb-3">
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
        className="relative w-full h-2.5 rounded-full overflow-hidden"
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

function VoltageWaveformSmall({ status }: { status: "STABLE" | "ELEVATED" }) {
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

      const amp = H * 0.32;
      ctx.beginPath();
      ctx.strokeStyle =
        status === "ELEVATED" ? "oklch(0.85 0.18 40)" : "oklch(0.78 0.16 75)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "oklch(0.78 0.16 75 / 0.5)";
      ctx.shadowBlur = 5;
      for (let x = 0; x < W; x++) {
        const y =
          H / 2 + Math.sin((x / W) * Math.PI * 4 + phaseRef.current) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phaseRef.current += 0.05;
      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [status]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={44}
      className="w-full h-[44px] rounded-lg"
      style={{ background: C_DARK }}
    />
  );
}

export default function AVEVABehavioralSensibility() {
  const [duress, setDuress] = useState(7.4);
  const [coercion, setCoercion] = useState(3.9);
  const [cognitive, setCognitive] = useState(9.1);
  const behaviorAlert = duress > 60 || coercion > 60 || cognitive > 60;
  const [txRate, setTxRate] = useState(2651);

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
      setTxRate((p) =>
        Math.max(
          2200,
          Math.min(3800, p + Math.floor((Math.random() - 0.5) * 80)),
        ),
      );
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="px-3 mt-3">
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
        className="rounded-xl overflow-hidden"
        style={{
          background: "oklch(0.10 0.02 75 / 0.5)",
          border: `1px solid ${C_AMBER_BORDER}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-3 py-2.5 border-b"
          style={{ borderColor: "oklch(0.22 0.025 75 / 0.5)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-sm"
              style={{
                background: C_AMBER_BG,
                border: `1px solid ${C_AMBER_BORDER}`,
              }}
            >
              🏭
            </div>
            <div>
              <p
                className="text-[10px] font-mono font-black tracking-widest uppercase"
                style={{ color: C_AMBER }}
              >
                AVEVA BEHAVIORAL SENSIBILITY ENGINE
              </p>
              <p
                className="text-[8px] font-mono"
                style={{ color: C_AMBER_DIM }}
              >
                Industrial-grade behavioral prediction · [DEMO]
              </p>
            </div>
          </div>
          <motion.span
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: C_AMBER_BG,
              border: `1px solid ${C_AMBER_BORDER}`,
              color: C_AMBER,
            }}
          >
            AVEVA ONLINE
          </motion.span>
        </div>

        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[9px] font-mono uppercase tracking-widest"
              style={{ color: C_AMBER_DIM }}
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

          {/* Corridor */}
          <div className="mt-2 rounded-xl p-2.5" style={{ background: C_DARK }}>
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-[8px] font-mono uppercase tracking-widest"
                style={{ color: C_AMBER_DIM }}
              >
                AVEVA GOVERNING HIGH-VOLTAGE CORRIDOR
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="text-[8px] font-mono font-bold"
                  style={{ color: C_GREEN }}
                >
                  STABLE
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
            <VoltageWaveformSmall status="STABLE" />
            <p
              className="text-[7px] font-mono text-center mt-1"
              style={{ color: "oklch(0.35 0.06 75)" }}
            >
              262.62 kV · Flat Banking High-Voltage Settlement Protocol
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
