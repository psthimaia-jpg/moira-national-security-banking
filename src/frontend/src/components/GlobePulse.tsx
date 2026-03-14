import { useEffect, useRef } from "react";

interface NodeDef {
  lat: number;
  lon: number;
  label: string;
  color: string;
}

const NODES: NodeDef[] = [
  { lat: 28, lon: 77, label: "IN-N", color: "oklch(0.72 0.18 200)" },
  { lat: 12, lon: 80, label: "IN-S", color: "oklch(0.72 0.18 200)" },
  { lat: 40, lon: -74, label: "US-E", color: "oklch(0.78 0.12 75)" },
  { lat: 34, lon: -118, label: "US-W", color: "oklch(0.78 0.12 75)" },
];

const BEAMS: [number, number][] = [
  [0, 2], // IN-N → US-E
  [0, 3], // IN-N → US-W
  [1, 2], // IN-S → US-E
  [1, 3], // IN-S → US-W
];

function latLonToXY(
  lat: number,
  lon: number,
  rotationY: number,
  cx: number,
  cy: number,
  r: number,
): { x: number; y: number; visible: boolean } {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = ((lon + rotationY) * Math.PI) / 180;
  const x3 = Math.cos(latRad) * Math.sin(lonRad);
  const y3 = Math.sin(latRad);
  const z3 = Math.cos(latRad) * Math.cos(lonRad);
  return {
    x: cx + r * x3,
    y: cy - r * y3,
    visible: z3 > -0.1,
  };
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  rotation: number,
) {
  ctx.strokeStyle = "rgba(100, 130, 200, 0.2)";
  ctx.lineWidth = 0.5;

  // Latitude lines
  for (let lat = -80; lat <= 80; lat += 20) {
    ctx.beginPath();
    let first = true;
    for (let lon = -180; lon <= 180; lon += 4) {
      const { x, y, visible } = latLonToXY(lat, lon, rotation, cx, cy, r);
      if (!visible) {
        first = true;
        continue;
      }
      if (first) {
        ctx.moveTo(x, y);
        first = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  // Longitude lines
  for (let lon = -180; lon < 180; lon += 30) {
    ctx.beginPath();
    let first = true;
    for (let lat = -90; lat <= 90; lat += 4) {
      const { x, y, visible } = latLonToXY(lat, lon, rotation, cx, cy, r);
      if (!visible) {
        first = true;
        continue;
      }
      if (first) {
        ctx.moveTo(x, y);
        first = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
}

export default function GlobePulse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const rotationRef = useRef(0);
  const pulseRef = useRef(0);
  const beamProgressRef = useRef([0, 0.25, 0.5, 0.75]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 280;
    const H = 200;
    const cx = W / 2;
    const cy = H / 2 - 8;
    const r = 82;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      // Globe sphere background
      const grad = ctx.createRadialGradient(cx - 20, cy - 20, 4, cx, cy, r);
      grad.addColorStop(0, "rgba(30, 45, 80, 0.7)");
      grad.addColorStop(1, "rgba(8, 12, 28, 0.9)");
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Subtle rim glow
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(80, 120, 200, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Grid lines
      drawGrid(ctx, cx, cy, r, rotationRef.current);

      // Compute node positions
      const nodePositions = NODES.map((n) =>
        latLonToXY(n.lat, n.lon, rotationRef.current, cx, cy, r),
      );

      // Draw beam arcs
      BEAMS.forEach(([fromIdx, toIdx], beamIdx) => {
        const from = nodePositions[fromIdx];
        const to = nodePositions[toIdx];
        if (!from.visible || !to.visible) return;

        // Control point for arc (push outward from center)
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const dx = midX - cx;
        const dy = midY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const bendFactor = 0.55;
        const cpX = midX + (dx / dist) * r * bendFactor;
        const cpY = midY + (dy / dist) * r * bendFactor;

        // Draw beam arc
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.quadraticCurveTo(cpX, cpY, to.x, to.y);
        ctx.strokeStyle = "rgba(80, 200, 200, 0.35)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Traveling pulse dot
        const t = beamProgressRef.current[beamIdx];
        const px =
          (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * cpX + t * t * to.x;
        const py =
          (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * cpY + t * t * to.y;

        const dotGrad = ctx.createRadialGradient(px, py, 0, px, py, 4);
        dotGrad.addColorStop(0, "rgba(120, 230, 230, 0.95)");
        dotGrad.addColorStop(1, "rgba(80, 200, 200, 0)");
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = dotGrad;
        ctx.fill();
      });

      // Draw node pulse rings
      nodePositions.forEach((pos, i) => {
        if (!pos.visible) return;
        const node = NODES[i];
        const isIndia = i < 2;
        const ringColor = isIndia
          ? "rgba(80, 200, 210, "
          : "rgba(220, 180, 80, ";

        // Outer ring (slow pulse)
        const outerAlpha = Math.max(
          0,
          0.4 - ((pulseRef.current + i * 0.25) % 1) * 0.4,
        );
        const outerR = 6 + ((pulseRef.current + i * 0.25) % 1) * 12;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, outerR, 0, Math.PI * 2);
        ctx.strokeStyle = `${ringColor}${outerAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Inner ring
        const innerAlpha = Math.max(
          0,
          0.6 - ((pulseRef.current + i * 0.25 + 0.3) % 1) * 0.6,
        );
        const innerR = 4 + ((pulseRef.current + i * 0.25 + 0.3) % 1) * 7;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, innerR, 0, Math.PI * 2);
        ctx.strokeStyle = `${ringColor}${innerAlpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // Node dot
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = isIndia
          ? "rgba(80, 210, 220, 0.95)"
          : "rgba(220, 175, 70, 0.95)";
        ctx.fill();

        // Node label
        ctx.font = "bold 8px monospace";
        ctx.fillStyle = isIndia
          ? "rgba(80, 210, 220, 0.9)"
          : "rgba(220, 175, 70, 0.9)";
        ctx.textAlign = "center";
        const labelY = i < 2 ? pos.y - 7 : pos.y + 14;
        ctx.fillText(node.label, pos.x, labelY);
      });

      // Mandate label
      ctx.font = "bold 8px monospace";
      ctx.fillStyle = "rgba(220, 175, 70, 0.8)";
      ctx.textAlign = "center";
      ctx.fillText("1,000,000 USER MANDATE", cx, H - 6);

      // Advance animation values
      rotationRef.current = (rotationRef.current + 0.18) % 360;
      pulseRef.current = (pulseRef.current + 0.008) % 1;
      beamProgressRef.current = beamProgressRef.current.map(
        (p) => (p + 0.006) % 1,
      );

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div
      style={{
        background: "oklch(0.10 0.015 255)",
        border: "1px solid oklch(0.35 0.06 255 / 0.4)",
        borderRadius: "16px",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: "9px",
          fontFamily: "monospace",
          color: "oklch(0.72 0.18 200)",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: "4px",
          opacity: 0.8,
        }}
      >
        6G GLOBAL PULSE · IN-NORTH / IN-SOUTH ↔ US-EAST / US-WEST
      </div>
      <canvas
        ref={canvasRef}
        width={280}
        height={200}
        style={{ background: "transparent", display: "block" }}
      />
    </div>
  );
}
