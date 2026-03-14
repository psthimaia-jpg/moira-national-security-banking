import { useEffect, useRef, useState } from "react";

const GOLD = "#f59e0b";
const GOLD_DIM = "rgba(245,158,11,0.18)";
const SAFFRON = "#fb923c";
const BLUE_DC = "#38bdf8";
const DARK_BG = "#08080f";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function drawNode(
  ctx: CanvasRenderingContext2D,
  frame: number,
  cx: number,
  cy: number,
  color: string,
  glowColor: string,
  label: string,
  sub: string,
  bpm: number,
) {
  const ringFrameOffset = color === SAFFRON ? 0 : 30;
  for (let r = 0; r < 3; r++) {
    const phase = ((frame + ringFrameOffset + r * 20) % 60) / 60;
    const radius = 22 + phase * 50;
    const alpha = (1 - phase) * 0.5;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
  coreGrad.addColorStop(0, `${glowColor}ff`);
  coreGrad.addColorStop(0.5, `${color}88`);
  coreGrad.addColorStop(1, "transparent");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fill();

  const sphereGrad = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, 16);
  sphereGrad.addColorStop(0, "#fff");
  sphereGrad.addColorStop(0.3, color);
  sphereGrad.addColorStop(1, `${glowColor}88`);
  ctx.fillStyle = sphereGrad;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(cx, cy, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.save();
  ctx.fillStyle = color;
  ctx.font = "bold 9px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(label, cx, cy + 34);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "8px 'JetBrains Mono', monospace";
  ctx.fillText(sub, cx, cy + 44);
  ctx.fillStyle = color;
  ctx.font = "bold 8px 'JetBrains Mono', monospace";
  ctx.fillText(`${bpm} BPM`, cx, cy + 55);
  ctx.restore();
}

export default function SovereignVisualizationEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [actorCount] = useState(847);
  const [bpmND, setBpmND] = useState(72);
  const [bpmDC, setBpmDC] = useState(68);

  useEffect(() => {
    const t = setInterval(() => {
      setBpmND(68 + Math.round(Math.sin(Date.now() / 2400) * 6));
      setBpmDC(64 + Math.round(Math.cos(Date.now() / 2700) * 6));
    }, 800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;

    function draw() {
      const W = canvas!.width;
      const H = canvas!.height;
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = DARK_BG;
      ctx!.fillRect(0, 0, W, H);

      // Starfield
      ctx!.save();
      for (let i = 0; i < 60; i++) {
        const x = (((i * 137.508 + frame * 0.02) % W) + W) % W;
        const y = (((i * 97.3 + frame * 0.01) % H) + H) % H;
        ctx!.globalAlpha = 0.2 + 0.3 * Math.sin(frame * 0.05 + i);
        ctx!.fillStyle = "#ffffff";
        ctx!.beginPath();
        ctx!.arc(x, y, 0.7, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.restore();

      const ndX = W * 0.22;
      const dcX = W * 0.78;
      const midY = H * 0.5;

      // Sovereign Axis beam
      const axisGrad = ctx!.createLinearGradient(ndX, midY, dcX, midY);
      axisGrad.addColorStop(0, `${SAFFRON}88`);
      axisGrad.addColorStop(0.5, `${GOLD}cc`);
      axisGrad.addColorStop(1, `${BLUE_DC}88`);
      ctx!.strokeStyle = axisGrad;
      ctx!.lineWidth = 2;
      ctx!.shadowColor = GOLD;
      ctx!.shadowBlur = 12;
      ctx!.beginPath();
      ctx!.moveTo(ndX, midY);
      ctx!.lineTo(dcX, midY);
      ctx!.stroke();
      ctx!.shadowBlur = 0;

      // Traveling pulse dots
      for (let d = 0; d < 4; d++) {
        const tVal = (((frame * 0.008 + d / 4) % 1) + 1) % 1;
        const dotX = lerp(ndX, dcX, tVal);
        ctx!.save();
        ctx!.globalAlpha = Math.sin(tVal * Math.PI);
        const dotGrad = ctx!.createRadialGradient(dotX, midY, 0, dotX, midY, 8);
        dotGrad.addColorStop(0, "#fff");
        dotGrad.addColorStop(0.4, GOLD);
        dotGrad.addColorStop(1, "transparent");
        ctx!.fillStyle = dotGrad;
        ctx!.beginPath();
        ctx!.arc(dotX, midY, 8, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }

      drawNode(
        ctx!,
        frame,
        ndX,
        midY,
        SAFFRON,
        "rgba(251,146,60,0.7)",
        "NEW DELHI",
        "IN-NODE",
        bpmND,
      );
      drawNode(
        ctx!,
        frame,
        dcX,
        midY,
        BLUE_DC,
        "rgba(56,189,248,0.7)",
        "D.C. NODE",
        "US-NODE",
        bpmDC,
      );

      // Center label
      ctx!.save();
      ctx!.fillStyle = GOLD;
      ctx!.font = "bold 9px 'JetBrains Mono', monospace";
      ctx!.textAlign = "center";
      ctx!.shadowColor = GOLD;
      ctx!.shadowBlur = 10;
      ctx!.fillText("SOVEREIGN AXIS", W / 2, midY - 14);
      ctx!.shadowBlur = 0;
      ctx!.fillStyle = "rgba(245,158,11,0.55)";
      ctx!.font = "8px 'JetBrains Mono', monospace";
      ctx!.fillText("LIVE \u25c9", W / 2, midY - 4);
      ctx!.restore();

      frame++;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [bpmND, bpmDC]);

  return (
    <div
      className="mx-3 mt-3 rounded-xl overflow-hidden"
      style={{
        background: DARK_BG,
        border: `1px solid ${GOLD_DIM}`,
        boxShadow: "0 0 24px rgba(245,158,11,0.12)",
      }}
    >
      <div
        className="px-3 py-2 flex items-center justify-between"
        style={{
          background: "rgba(245,158,11,0.08)",
          borderBottom: `1px solid ${GOLD_DIM}`,
        }}
      >
        <div>
          <p
            className="text-[10px] font-mono font-bold tracking-widest"
            style={{ color: GOLD }}
          >
            SOVEREIGN VISUALIZATION ENGINE
          </p>
          <p
            className="text-[9px] font-mono"
            style={{ color: "rgba(245,158,11,0.55)" }}
          >
            v24 EXCLUSIVE \u00b7 REAL-TIME NODE HEARTBEAT
          </p>
        </div>
        <span
          className="text-[8px] font-mono px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(245,158,11,0.15)",
            border: `1px solid ${GOLD_DIM}`,
            color: GOLD,
          }}
        >
          DEMO
        </span>
      </div>

      <canvas
        ref={canvasRef}
        width={360}
        height={160}
        className="w-full"
        style={{ display: "block" }}
      />

      <div
        className="px-3 py-2 grid grid-cols-3 gap-2"
        style={{ borderTop: `1px solid ${GOLD_DIM}` }}
      >
        {[
          { label: "Motoko Actors", value: actorCount.toLocaleString() },
          { label: "Anti-Fragile", value: "ACTIVE" },
          { label: "Sovereign Axis", value: "LIVE" },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p
              className="text-[11px] font-mono font-bold"
              style={{ color: GOLD }}
            >
              {value}
            </p>
            <p
              className="text-[8px] font-mono"
              style={{ color: "rgba(245,158,11,0.5)" }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
