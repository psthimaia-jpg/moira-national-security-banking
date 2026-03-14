import { useEffect, useRef, useState } from "react";

const GOLD = "#f59e0b";
const GOLD_DIM = "rgba(245,158,11,0.2)";

interface Metrics {
  frictionIndex: number;
  smes: number;
  costSavings: number;
  tradeUplift: number;
  settleTime: number;
  humanImpact: number;
}

export default function AISocietalImpactPredictor() {
  const [metrics, setMetrics] = useState<Metrics>({
    frictionIndex: 68,
    smes: 2_400_000,
    costSavings: 12.4,
    tradeUplift: 34,
    settleTime: 4.2,
    humanImpact: 12,
  });
  const startRef = useRef(Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const friction = Math.max(23, 68 - (elapsed / 120) * 45);
      const human = Math.min(88, 12 + (elapsed / 120) * 76);
      const costSave = Math.max(8.2, 12.4 - (elapsed / 120) * 4.2);
      const settle = Math.max(0.8, 4.2 - (elapsed / 120) * 3.4);
      const smes = Math.round(2_400_000 + elapsed * 80);
      setMetrics({
        frictionIndex: Math.round(friction * 10) / 10,
        smes,
        costSavings: Math.round(costSave * 100) / 100,
        tradeUplift: 34,
        settleTime: Math.round(settle * 10) / 10,
        humanImpact: Math.round(human * 10) / 10,
      });
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const frictionPct = metrics.frictionIndex;
  const frictionColor =
    frictionPct < 35 ? "#22c55e" : frictionPct < 55 ? "#eab308" : "#f97316";

  return (
    <div
      className="mx-3 mt-3 mb-3 rounded-xl overflow-hidden"
      style={{
        background: "oklch(0.11 0.018 50)",
        border: `1px solid ${GOLD_DIM}`,
        boxShadow: "0 0 20px rgba(245,158,11,0.08)",
      }}
    >
      <div
        className="px-3 py-2.5"
        style={{
          background:
            "linear-gradient(90deg, rgba(245,158,11,0.12), rgba(0,0,0,0))",
          borderBottom: `1px solid ${GOLD_DIM}`,
        }}
      >
        <p
          className="text-[10px] font-mono font-bold tracking-widest"
          style={{ color: GOLD }}
        >
          AI SOCIETAL IMPACT PREDICTOR
        </p>
        <p
          className="text-[9px] font-mono mt-0.5"
          style={{ color: "rgba(245,158,11,0.5)" }}
        >
          Cross-Border Trade Bridge \u00b7 v24
        </p>
      </div>

      <div className="px-3 py-3">
        {/* Friction gauge */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <p
              className="text-[9px] font-mono"
              style={{ color: "rgba(245,158,11,0.6)" }}
            >
              Transaction Friction Index
            </p>
            <p
              className="text-sm font-mono font-bold"
              style={{ color: frictionColor }}
            >
              {frictionPct}%
            </p>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${frictionPct}%`,
                background: `linear-gradient(90deg, ${frictionColor}, ${GOLD})`,
                boxShadow: `0 0 8px ${frictionColor}`,
              }}
            />
          </div>
          <p
            className="text-[8px] font-mono mt-0.5"
            style={{ color: "rgba(245,158,11,0.35)" }}
          >
            Declining toward 23% as sovereign bridge activates
          </p>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            {
              label: "SMEs Projected to Benefit",
              value: `${(metrics.smes / 1_000_000).toFixed(2)}M`,
            },
            {
              label: "Avg Cost Savings / Txn",
              value: `$${metrics.costSavings.toFixed(2)}`,
            },
            { label: "Trade Volume Uplift", value: `+${metrics.tradeUplift}%` },
            { label: "Time to Settle", value: `${metrics.settleTime} days` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg px-2.5 py-2"
              style={{
                background: "oklch(0.14 0.02 50)",
                border: `1px solid ${GOLD_DIM}`,
              }}
            >
              <p
                className="text-[9px] font-mono"
                style={{ color: "rgba(245,158,11,0.45)" }}
              >
                {label}
              </p>
              <p
                className="text-[13px] font-mono font-bold mt-0.5"
                style={{ color: GOLD }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Corridors */}
        <div
          className="rounded-lg px-2.5 py-2 mb-3"
          style={{
            background: "oklch(0.14 0.02 50)",
            border: `1px solid ${GOLD_DIM}`,
          }}
        >
          <p
            className="text-[9px] font-mono mb-1"
            style={{ color: "rgba(245,158,11,0.45)" }}
          >
            Cross-Border Corridors
          </p>
          <div className="flex gap-2 flex-wrap">
            {["IN\u2194US", "IN\u2194EU", "IN\u2194ASEAN"].map((c) => (
              <span
                key={c}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(245,158,11,0.1)",
                  border: `1px solid ${GOLD_DIM}`,
                  color: GOLD,
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Human Impact Score */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <p
              className="text-[9px] font-mono"
              style={{ color: "rgba(245,158,11,0.6)" }}
            >
              Human Impact Score
            </p>
            <p className="text-xs font-mono font-bold" style={{ color: GOLD }}>
              {metrics.humanImpact}%
            </p>
          </div>
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${metrics.humanImpact}%`,
                background: `linear-gradient(90deg, #22c55e, ${GOLD})`,
                boxShadow: "0 0 10px rgba(34,197,94,0.4)",
              }}
            />
          </div>
        </div>

        {/* Quote */}
        <div
          className="rounded-lg px-3 py-2 text-center"
          style={{
            background: "rgba(245,158,11,0.06)",
            border: `1px solid ${GOLD_DIM}`,
          }}
        >
          <p
            className="text-[9px] font-mono italic"
            style={{ color: "rgba(245,158,11,0.7)" }}
          >
            &ldquo;Lowering friction for 2.4M small businesses across the
            India-USA sovereign bridge&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
