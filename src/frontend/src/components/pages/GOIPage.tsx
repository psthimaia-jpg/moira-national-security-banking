import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  Globe,
  Loader2,
  MapPin,
  OctagonX,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AISocietalImpactPredictor from "../AISocietalImpactPredictor";

type TokenStatus = "PENDING" | "SETTLING" | "SETTLED";

interface PropertyToken {
  id: string;
  tokenId: string;
  propertyName: string;
  state: string;
  valueInCr: number;
  status: TokenStatus;
}

const STATES = [
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Delhi",
  "Gujarat",
  "Rajasthan",
  "UP",
  "WB",
  "AP",
  "Kerala",
];
const PROPERTY_NAMES = [
  "SBI Main Branch, MG Road",
  "PNB Heritage Tower",
  "Bank of Baroda Complex",
  "Canara Bank Premises",
  "Union Bank Plaza",
  "Indian Bank HQ",
  "Central Bank Annex",
  "UCO Bank Tower",
  "Allahabad Bank Estate",
  "Dena Bank Commercial Block",
];

function genTokens(): PropertyToken[] {
  return PROPERTY_NAMES.map((name, i) => ({
    id: `pt${i + 1}`,
    tokenId: `NWOS-${(i + 1).toString().padStart(6, "0")}`,
    propertyName: name,
    state: STATES[i % STATES.length],
    valueInCr: Math.round((3.2 + Math.random() * 2) * 10) / 10,
    status: i < 3 ? "PENDING" : i < 6 ? "SETTLING" : "SETTLED",
  }));
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono-code text-xs">
      {time.toLocaleTimeString("en-IN")}
    </span>
  );
}

interface Props {
  inactionActive?: boolean;
}

export default function GOIPage({ inactionActive = false }: Props) {
  const [tokens, setTokens] = useState<PropertyToken[]>(genTokens);
  const [settledCount, setSettledCount] = useState(89421);
  const [aiValuations, setAiValuations] = useState(() =>
    genTokens().map((t) => ({
      id: t.id,
      score: Number.parseFloat((88 + Math.random() * 10).toFixed(1)),
      delta: Number.parseFloat((-2 + Math.random() * 5).toFixed(1)),
      confidence: Math.floor(84 + Math.random() * 14),
    })),
  );
  const [nationalWealth, setNationalWealth] = useState(3420000);

  const [jobProgress, setJobProgress] = useState(623);
  const [sensorFeed, setSensorFeed] = useState<string[]>([
    "[03:14:22] URLLC SLICE — Sovereign data packet received",
    "[03:14:18] Token NWOS-000043 settlement confirmed",
    "[03:14:15] IN-NORTH node latency: 0.42ms",
    "[03:14:12] US-EAST handshake verified",
    "[03:14:09] Prosperity index updated: +12 jobs",
  ]);
  const [systemStatus] = useState({
    backend: "OPERATIONAL",
    icp: "LIVE",
    uptime: "99.97%",
  });
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const msgs = [
      () =>
        `[${new Date().toTimeString().slice(0, 8)}] Token NWOS-${String(Math.floor(Math.random() * 99999)).padStart(6, "0")} — settlement queued`,
      () =>
        `[${new Date().toTimeString().slice(0, 8)}] URLLC slice throughput: ${(0.3 + Math.random() * 0.5).toFixed(2)}ms`,
      () =>
        `[${new Date().toTimeString().slice(0, 8)}] Quantum key rotated — CRYSTALS-Kyber`,
      () =>
        `[${new Date().toTimeString().slice(0, 8)}] Prosperity: ${Math.floor(Math.random() * 50) + 10} new jobs registered`,
      () =>
        `[${new Date().toTimeString().slice(0, 8)}] IN-SOUTH sync: ${(0.2 + Math.random() * 0.4).toFixed(2)}ms`,
    ];
    const t = setInterval(() => {
      const msg = msgs[Math.floor(Math.random() * msgs.length)]();
      setSensorFeed((prev) => [msg, ...prev.slice(0, 9)]);
      setSettledCount((prev) => prev + Math.floor(Math.random() * 3));
      setJobProgress((prev) =>
        Math.min(1000, prev + Math.floor(Math.random() * 2)),
      );
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const handleSettle = (id: string) => {
    if (inactionActive) return;
    setTokens((prev) =>
      prev.map((t) =>
        t.id === id && t.status === "PENDING"
          ? { ...t, status: "SETTLING" }
          : t,
      ),
    );
    toast.success("Settlement initiated — URLLC sovereign channel");
    setTimeout(() => {
      setTokens((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "SETTLED" } : t)),
      );
      setSettledCount((c) => c + 1);
    }, 2500);
  };

  const handleLockVaults = () => {
    toast.error("🔴 EMERGENCY: All NWOS vaults locked — GOI directive issued", {
      duration: 5000,
    });
  };

  const handleBroadcast = () => {
    toast("📡 GOI BROADCAST: Sovereign alert transmitted to all MOIRA nodes", {
      duration: 4000,
    });
  };

  // AI valuation ticker
  useEffect(() => {
    const t = setInterval(() => {
      setAiValuations((prev) =>
        prev.map((v) => ({
          ...v,
          score: Number.parseFloat(
            Math.max(
              80,
              Math.min(99, v.score + (Math.random() - 0.5) * 0.4),
            ).toFixed(1),
          ),
          delta: Number.parseFloat((-2 + Math.random() * 5).toFixed(1)),
          confidence: Math.min(
            99,
            Math.max(82, v.confidence + Math.floor((Math.random() - 0.5) * 2)),
          ),
        })),
      );
      setNationalWealth((w) => w + Math.floor(Math.random() * 500 - 100));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const statusColor = (s: TokenStatus) => {
    if (s === "SETTLED") return "oklch(0.65 0.16 150)";
    if (s === "SETTLING") return "oklch(0.78 0.12 75)";
    return "oklch(0.6 0.18 200)";
  };

  return (
    <div className="pb-4">
      {inactionActive && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          style={{
            background: "oklch(0.08 0.015 20 / 0.7)",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            className="flex flex-col items-center gap-2 px-6 py-5 rounded-2xl"
            style={{
              background: "oklch(0.12 0.03 20 / 0.9)",
              border: "1px solid oklch(0.62 0.2 18 / 0.5)",
            }}
          >
            <OctagonX
              className="w-10 h-10"
              style={{ color: "oklch(0.75 0.18 18)" }}
            />
            <p
              className="font-display font-bold text-sm tracking-widest"
              style={{ color: "oklch(0.75 0.18 18)" }}
            >
              INACTION SAFETY
            </p>
          </div>
        </div>
      )}

      {/* GOI Header — tricolor */}
      <div style={{ background: "oklch(0.11 0.015 255)" }}>
        <div
          style={{
            height: 4,
            background:
              "linear-gradient(90deg, oklch(0.72 0.16 55), oklch(0.72 0.16 55) 33%, white 33%, white 66%, oklch(0.55 0.16 145) 66%)",
          }}
        />
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "oklch(0.55 0.16 145 / 0.15)",
                border: "1px solid oklch(0.55 0.16 145 / 0.35)",
              }}
            >
              <Globe
                className="w-4 h-4"
                style={{ color: "oklch(0.55 0.16 145)" }}
              />
            </div>
            <div>
              <p
                className="text-xs font-display font-bold tracking-wider"
                style={{ color: "oklch(0.88 0.06 75)" }}
              >
                GOI COMMAND CENTER
              </p>
              <p
                className="text-[10px] font-body"
                style={{ color: "oklch(0.55 0.08 255)" }}
              >
                MOIRA NWOS · Sovereign Operations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LiveClock />
            <Badge
              className="text-[9px] px-1.5 py-0.5"
              style={{
                background: "oklch(0.55 0.16 145 / 0.15)",
                border: "1px solid oklch(0.55 0.16 145 / 0.4)",
                color: "oklch(0.7 0.14 145)",
              }}
            >
              SECURE
            </Badge>
          </div>
        </div>
        <div
          style={{
            height: 4,
            background:
              "linear-gradient(90deg, oklch(0.72 0.16 55), oklch(0.72 0.16 55) 33%, white 33%, white 66%, oklch(0.55 0.16 145) 66%)",
          }}
        />
      </div>

      {/* Property Tokenization Engine */}
      <div
        className="mx-3 mt-3 rounded-xl overflow-hidden"
        style={{
          border: "1px solid oklch(0.28 0.04 75 / 0.5)",
          background: "oklch(0.13 0.02 255)",
        }}
      >
        <div
          className="px-3 py-2.5 border-b"
          style={{
            borderColor: "oklch(0.22 0.025 255)",
            background: "oklch(0.15 0.025 255)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2
                className="w-4 h-4"
                style={{ color: "oklch(0.78 0.12 75)" }}
              />
              <p
                className="text-xs font-display font-bold"
                style={{ color: "oklch(0.88 0.08 75)" }}
              >
                Property Tokenization Engine
              </p>
            </div>
            <Badge
              style={{
                background: "oklch(0.22 0.04 75 / 0.5)",
                border: "1px solid oklch(0.55 0.1 75 / 0.5)",
                color: "oklch(0.88 0.1 75)",
                fontSize: "9px",
              }}
            >
              1 LAKH TOKENS
            </Badge>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="grid grid-cols-3 gap-0 border-b"
          style={{ borderColor: "oklch(0.22 0.025 255)" }}
        >
          {[
            {
              label: "Total Tokens",
              value: "1,00,000",
              color: "oklch(0.78 0.12 75)",
            },
            {
              label: "Settled",
              value: settledCount.toLocaleString("en-IN"),
              color: "oklch(0.65 0.16 150)",
            },
            {
              label: "Total Value",
              value: "₹4.2L Cr",
              color: "oklch(0.6 0.18 200)",
            },
          ].map(({ label, value, color }, i) => (
            <div
              key={label}
              className={`px-3 py-2.5 text-center ${i < 2 ? "border-r" : ""}`}
              style={{ borderColor: "oklch(0.22 0.025 255)" }}
            >
              <p className="text-sm font-display font-bold" style={{ color }}>
                {value}
              </p>
              <p
                className="text-[9px] font-body mt-0.5"
                style={{ color: "oklch(0.5 0.04 255)" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Token table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr style={{ borderBottom: "1px solid oklch(0.22 0.025 255)" }}>
                {[
                  "Token ID",
                  "Property",
                  "State",
                  "Value",
                  "AI Val",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-2 py-2 text-left font-mono-code font-semibold"
                    style={{ color: "oklch(0.5 0.04 255)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tokens.map((tok, i) => (
                <tr
                  key={tok.id}
                  data-ocid={`goi.token.item.${i + 1}`}
                  style={{ borderBottom: "1px solid oklch(0.18 0.02 255)" }}
                >
                  <td
                    className="px-2 py-2 font-mono-code"
                    style={{ color: "oklch(0.6 0.1 200)" }}
                  >
                    {tok.tokenId}
                  </td>
                  <td
                    className="px-2 py-2 font-body max-w-[80px] truncate"
                    style={{ color: "oklch(0.82 0.04 255)" }}
                    title={tok.propertyName}
                  >
                    {tok.propertyName}
                  </td>
                  <td
                    className="px-2 py-2 font-body"
                    style={{ color: "oklch(0.65 0.06 255)" }}
                  >
                    {tok.state}
                  </td>
                  <td
                    className="px-2 py-2 font-mono-code"
                    style={{ color: "oklch(0.78 0.12 75)" }}
                  >
                    ₹{tok.valueInCr}Cr
                  </td>
                  <td className="px-2 py-2">
                    {(() => {
                      const av = aiValuations[i];
                      if (!av) return null;
                      return (
                        <div className="flex flex-col gap-0.5 min-w-[52px]">
                          <div className="flex items-center gap-1">
                            <span
                              className="text-[9px] font-mono-code font-bold"
                              style={{ color: "oklch(0.72 0.16 55)" }}
                            >
                              {av.score}
                            </span>
                            <span
                              className="text-[8px] font-mono-code"
                              style={{
                                color:
                                  av.delta >= 0
                                    ? "oklch(0.65 0.16 150)"
                                    : "oklch(0.65 0.22 15)",
                              }}
                            >
                              {av.delta >= 0 ? "↑" : "↓"}
                              {Math.abs(av.delta)}%
                            </span>
                          </div>
                          <div
                            className="w-full rounded-full overflow-hidden"
                            style={{
                              height: 2,
                              background: "oklch(0.22 0.025 255)",
                            }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${av.confidence}%`,
                                background: "oklch(0.72 0.16 55)",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-2 py-2">
                    {tok.status === "PENDING" ? (
                      <button
                        type="button"
                        data-ocid={`goi.settle.button.${i + 1}`}
                        onClick={() => handleSettle(tok.id)}
                        disabled={inactionActive}
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono-code font-bold disabled:opacity-40"
                        style={{
                          background: "oklch(0.6 0.18 200 / 0.15)",
                          border: "1px solid oklch(0.6 0.18 200 / 0.4)",
                          color: "oklch(0.7 0.16 200)",
                        }}
                      >
                        SETTLE
                      </button>
                    ) : (
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono-code font-bold"
                        style={{
                          background: `${statusColor(tok.status)} / 0.12`,
                          color: statusColor(tok.status),
                        }}
                      >
                        {tok.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Dynamic Asset Valuation — National Wealth Ticker */}
      <div
        className="mx-3 mt-3 rounded-xl overflow-hidden"
        style={{
          border: "1px solid oklch(0.72 0.16 55 / 0.4)",
          background: "oklch(0.10 0.015 55 / 0.25)",
        }}
      >
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ borderBottom: "1px solid oklch(0.22 0.025 255)" }}
        >
          <div className="flex items-center gap-2">
            <TrendingUp
              className="w-4 h-4"
              style={{ color: "oklch(0.72 0.16 55)" }}
            />
            <p
              className="text-xs font-display font-bold"
              style={{ color: "oklch(0.82 0.12 55)" }}
            >
              NATIONAL WEALTH RECALCULATION — AI COMPUTED
            </p>
          </div>
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
        </div>
        <div className="px-3 py-3 flex items-center justify-between">
          <div>
            <p
              className="text-[9px] font-mono-code"
              style={{ color: "oklch(0.5 0.04 255)" }}
            >
              Total AI-Computed National Asset Value
            </p>
            <p
              className="text-xl font-mono-code font-bold"
              style={{ color: "oklch(0.72 0.16 55)" }}
            >
              ₹{nationalWealth.toLocaleString("en-IN")} Cr
            </p>
            <p
              className="text-[9px] font-mono-code mt-0.5"
              style={{ color: "oklch(0.65 0.16 150)" }}
            >
              ↑ Dynamic yield active · Updates every 3s · DEMO
            </p>
          </div>
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{
              background: "oklch(0.72 0.16 55)",
              boxShadow: "0 0 8px oklch(0.72 0.16 55)",
            }}
          />
        </div>
      </div>

      {/* Prosperity Tracker */}
      <div
        className="mx-3 mt-3 rounded-xl px-3 py-3"
        style={{
          background: "oklch(0.13 0.025 255)",
          border: "1px solid oklch(0.28 0.04 255)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp
              className="w-4 h-4"
              style={{ color: "oklch(0.65 0.16 150)" }}
            />
            <p
              className="text-xs font-display font-bold"
              style={{ color: "oklch(0.82 0.06 255)" }}
            >
              Prosperity Tracker
            </p>
          </div>
          <span
            className="text-[10px] font-mono-code"
            style={{ color: "oklch(0.65 0.16 150)" }}
          >
            {jobProgress}/1,000 Jobs
          </span>
        </div>
        <p
          className="text-[10px] font-body mb-2"
          style={{ color: "oklch(0.55 0.04 255)" }}
        >
          1,000 High-Value Jobs — India-USA Economic Corridor
        </p>
        <Progress value={(jobProgress / 1000) * 100} className="h-2" />
        <div className="flex justify-between mt-1">
          <span
            className="text-[9px] font-mono-code"
            style={{ color: "oklch(0.45 0.04 255)" }}
          >
            IN-NORTH · IN-SOUTH
          </span>
          <span
            className="text-[9px] font-mono-code"
            style={{ color: "oklch(0.45 0.04 255)" }}
          >
            US-EAST · US-WEST
          </span>
        </div>
      </div>

      {/* System Status */}
      <div
        className="mx-3 mt-3 rounded-xl px-3 py-3"
        style={{
          background: "oklch(0.13 0.02 255)",
          border: "1px solid oklch(0.26 0.03 255)",
        }}
      >
        <p
          className="text-xs font-display font-bold mb-2"
          style={{ color: "oklch(0.82 0.06 255)" }}
        >
          System Status
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Backend", value: systemStatus.backend, ok: true },
            { label: "ICP Network", value: systemStatus.icp, ok: true },
            { label: "Uptime", value: systemStatus.uptime, ok: true },
          ].map(({ label, value, ok }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 py-2 rounded-lg"
              style={{
                background: "oklch(0.16 0.022 255)",
                border: "1px solid oklch(0.24 0.028 255)",
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: ok
                    ? "oklch(0.65 0.16 150)"
                    : "oklch(0.65 0.22 15)",
                }}
              />
              <p
                className="text-[10px] font-mono-code font-bold"
                style={{
                  color: ok ? "oklch(0.65 0.16 150)" : "oklch(0.65 0.22 15)",
                }}
              >
                {value}
              </p>
              <p
                className="text-[9px] font-body"
                style={{ color: "oklch(0.45 0.04 255)" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sensor Telemetry */}
      <div
        className="mx-3 mt-3 rounded-xl overflow-hidden"
        style={{
          border: "1px solid oklch(0.28 0.04 150 / 0.4)",
          background: "oklch(0.07 0.01 150)",
        }}
      >
        <div
          className="flex items-center gap-2 px-3 py-2 border-b"
          style={{ borderColor: "oklch(0.18 0.03 150 / 0.5)" }}
        >
          <Activity
            className="w-3.5 h-3.5"
            style={{ color: "oklch(0.65 0.16 150)" }}
          />
          <p
            className="text-[10px] font-mono-code font-bold"
            style={{ color: "oklch(0.65 0.16 150)" }}
          >
            SENSOR TELEMETRY FEED
          </p>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
            className="w-1.5 h-1.5 rounded-full ml-auto"
            style={{ background: "oklch(0.65 0.16 150)" }}
          />
        </div>
        <div
          ref={feedRef}
          className="px-3 py-2 space-y-1 max-h-28 overflow-y-auto"
        >
          {sensorFeed.map((line) => (
            <p
              key={line.slice(0, 25)}
              className="text-[9px] font-mono-code"
              style={{
                color:
                  sensorFeed.indexOf(line) === 0
                    ? "oklch(0.75 0.18 150)"
                    : "oklch(0.5 0.1 150)",
              }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Financial Command */}
      <div
        className="mx-3 mt-3 rounded-xl px-3 py-3"
        style={{
          background: "oklch(0.13 0.02 255)",
          border: "1px solid oklch(0.26 0.03 255)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3
            className="w-4 h-4"
            style={{ color: "oklch(0.78 0.12 75)" }}
          />
          <p
            className="text-xs font-display font-bold"
            style={{ color: "oklch(0.82 0.06 255)" }}
          >
            Financial Command Panel
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: "India National Pool",
              value: "$3.0T",
              sub: "4.2% yield active",
              color: "oklch(0.72 0.16 55)",
            },
            {
              label: "USA National Pool",
              value: "$30.0T",
              sub: "5.8% yield active",
              color: "oklch(0.6 0.18 200)",
            },
            {
              label: "Properties Tokenized",
              value: "1,00,000",
              sub: "₹4.2L Crore",
              color: "oklch(0.78 0.12 75)",
            },
            {
              label: "Settlements Today",
              value: settledCount.toLocaleString("en-IN"),
              sub: "Sovereign channel",
              color: "oklch(0.65 0.16 150)",
            },
          ].map(({ label, value, sub, color }) => (
            <div
              key={label}
              className="rounded-lg px-2.5 py-2"
              style={{
                background: "oklch(0.16 0.022 255)",
                border: "1px solid oklch(0.24 0.028 255)",
              }}
            >
              <p className="text-sm font-display font-bold" style={{ color }}>
                {value}
              </p>
              <p
                className="text-[10px] font-body"
                style={{ color: "oklch(0.75 0.04 255)" }}
              >
                {label}
              </p>
              <p
                className="text-[9px] font-mono-code"
                style={{ color: "oklch(0.45 0.04 255)" }}
              >
                {sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Societal Impact Predictor - v24 */}
      <AISocietalImpactPredictor />

      {/* Emergency Controls */}
      <div className="mx-3 mt-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            data-ocid="goi.lock_vaults.primary_button"
            onClick={handleLockVaults}
            disabled={inactionActive}
            className="h-10 text-xs font-display font-bold tracking-wider disabled:opacity-40"
            style={{
              background: "oklch(0.16 0.04 20)",
              border: "1px solid oklch(0.55 0.2 20 / 0.5)",
              color: "oklch(0.75 0.18 18)",
            }}
          >
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            LOCK ALL VAULTS
          </Button>
          <Button
            data-ocid="goi.broadcast.primary_button"
            onClick={handleBroadcast}
            disabled={inactionActive}
            className="h-10 text-xs font-display font-bold tracking-wider disabled:opacity-40"
            style={{
              background: "oklch(0.14 0.03 255)",
              border: "1px solid oklch(0.5 0.1 255 / 0.5)",
              color: "oklch(0.75 0.12 255)",
            }}
          >
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            BROADCAST ALERT
          </Button>
        </div>
      </div>

      <div className="text-center mt-6 pb-2">
        <p
          className="text-[9px] font-mono-code"
          style={{ color: "oklch(0.35 0.03 255)" }}
        >
          © P.S. Thimaia · CC BY-NC-ND · Make in India · Powered by 26.ai
        </p>
      </div>
    </div>
  );
}
