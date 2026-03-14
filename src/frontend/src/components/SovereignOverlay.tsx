import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STREAM_LABELS = [
  "KAFKA",
  "CASSANDRA",
  "6G-SLICE",
  "STREAM",
  "BLOCK",
  "URLLC",
  "NODE",
  "TX",
  "SHARD",
  "REPLICA",
  "PARTITION",
  "LEDGER",
  "EPOCH",
  "COMMIT",
  "QUEUE",
  "SYNC",
  "SLICE",
  "BEAM",
];

const SIXG_LABELS = new Set(["6G-SLICE", "URLLC", "BEAM", "SLICE"]);

interface StreamColumn {
  x: number;
  items: { label: string; y: number; speed: number; alpha: number }[];
}

interface SovereignOverlayProps {
  onClose: () => void;
}

export default function SovereignOverlay({ onClose }: SovereignOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const columnsRef = useRef<StreamColumn[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [streamCount, setStreamCount] = useState(
    () => Math.floor(Math.random() * 9000) + 1000,
  );

  // Update stream count every 2s
  useEffect(() => {
    const interval = setInterval(() => {
      setStreamCount(Math.floor(Math.random() * 9000) + 1000);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.offsetWidth || 380;
    const H = canvas.offsetHeight || 500;
    canvas.width = W;
    canvas.height = H;

    const NUM_COLUMNS = 11;
    const colSpacing = W / NUM_COLUMNS;

    // Initialize columns
    columnsRef.current = Array.from({ length: NUM_COLUMNS }, (_, i) => ({
      x: colSpacing * i + colSpacing / 2,
      items: Array.from({ length: 4 }, (__, j) => ({
        label: STREAM_LABELS[Math.floor(Math.random() * STREAM_LABELS.length)],
        y: -j * (H / 3) - Math.random() * 40,
        speed: 0.6 + Math.random() * 1.0,
        alpha: 0.3 + Math.random() * 0.5,
      })),
    }));

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      for (const col of columnsRef.current) {
        for (const item of col.items) {
          const isSixG = SIXG_LABELS.has(item.label);
          ctx.font = `bold ${isSixG ? 10 : 9}px monospace`;

          if (isSixG) {
            ctx.fillStyle = `rgba(80, 200, 210, ${item.alpha * 0.85})`;
          } else {
            ctx.fillStyle = `rgba(80, 200, 130, ${item.alpha * 0.75})`;
          }

          ctx.textAlign = "center";
          ctx.fillText(item.label, col.x, item.y);

          // Trail above
          const trailAlpha = item.alpha * 0.25;
          ctx.fillStyle = isSixG
            ? `rgba(80, 200, 210, ${trailAlpha})`
            : `rgba(80, 200, 130, ${trailAlpha})`;
          ctx.fillText(item.label, col.x, item.y - 14);

          // Advance y
          item.y += item.speed;

          // Reset when off screen
          if (item.y > H + 20) {
            item.y = -16;
            item.label =
              STREAM_LABELS[Math.floor(Math.random() * STREAM_LABELS.length)];
            item.speed = 0.6 + Math.random() * 1.0;
            item.alpha = 0.3 + Math.random() * 0.5;
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      data-ocid="sovereign_overlay.panel"
      className="absolute inset-0 z-50 overflow-hidden"
      style={{
        background: "oklch(0.06 0.01 255 / 0.88)",
        backdropFilter: "blur(1px)",
      }}
    >
      {/* Matrix canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.85 }}
      />

      {/* Close button */}
      <button
        type="button"
        data-ocid="sovereign_overlay.close_button"
        onClick={onClose}
        className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all"
        style={{
          background: "oklch(0.15 0.025 255 / 0.9)",
          border: "1px solid oklch(0.72 0.18 200 / 0.4)",
          color: "oklch(0.72 0.18 200)",
        }}
        aria-label="Close Sovereign View"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Center info card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="pointer-events-auto rounded-xl p-4 mx-6"
          style={{
            background: "oklch(0.09 0.015 255 / 0.92)",
            border: "1px solid oklch(0.72 0.18 200 / 0.4)",
            boxShadow:
              "0 0 40px oklch(0.72 0.18 200 / 0.15), 0 8px 32px oklch(0 0 0 / 0.5)",
            backdropFilter: "blur(4px)",
          }}
        >
          {/* Gold title */}
          <p
            className="text-[11px] font-mono font-bold tracking-widest text-center mb-0.5"
            style={{ color: "oklch(0.78 0.12 75)" }}
          >
            SOVEREIGN VIEW — INVISIBLE LAYER
          </p>
          <p
            className="text-[8px] font-mono text-center mb-3"
            style={{ color: "oklch(0.72 0.18 200)" }}
          >
            Kafka streams · Cassandra blocks · 6G slices
          </p>

          {/* Stats row */}
          <div
            className="grid grid-cols-3 gap-2 mb-3 p-2 rounded-lg"
            style={{
              background: "oklch(0.12 0.02 255)",
              border: "1px solid oklch(0.25 0.03 255)",
            }}
          >
            {[
              {
                label: "KAFKA",
                value: "ACTIVE",
                color: "oklch(0.65 0.16 150)",
              },
              {
                label: "CASSANDRA",
                value: "SYNCED",
                color: "oklch(0.72 0.18 200)",
              },
              {
                label: "6G SLICE",
                value: "LIVE",
                color: "oklch(0.78 0.12 75)",
              },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div
                  className="text-[7px] font-mono tracking-widest"
                  style={{ color: "oklch(0.4 0.04 255)" }}
                >
                  {item.label}
                </div>
                <div
                  className="text-[9px] font-mono font-bold"
                  style={{ color: item.color }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Live counter */}
          <div
            className="flex items-center justify-between px-2.5 py-2 rounded-lg"
            style={{
              background: "oklch(0.10 0.015 255)",
              border: "1px solid oklch(0.72 0.18 200 / 0.25)",
            }}
          >
            <span
              className="text-[8px] font-mono tracking-wider"
              style={{ color: "oklch(0.45 0.06 200)" }}
            >
              Active Streams:
            </span>
            <span
              className="text-[11px] font-mono font-bold tabular-nums"
              style={{ color: "oklch(0.72 0.18 200)" }}
            >
              {streamCount.toLocaleString()}
            </span>
          </div>

          <p
            className="text-[7px] font-mono text-center mt-2"
            style={{ color: "oklch(0.35 0.04 255)" }}
          >
            Di=AI INVISIBLE LAYER ACTIVE
          </p>
        </div>
      </div>
    </div>
  );
}
