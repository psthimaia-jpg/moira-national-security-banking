import { useEffect, useState } from "react";

const VIOLET_BORDER = "oklch(0.38 0.12 290 / 0.4)";
const VIOLET_CARD = "oklch(0.13 0.025 290)";
const VIOLET_ACCENT = "oklch(0.62 0.22 290)";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number, decimals = 1) {
  return (Math.random() * (max - min) + min).toFixed(decimals);
}
function hexToken() {
  return Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}

interface TelemetryData {
  latency: number;
  lastSync: string;
  treasuryNode: string;
  sessionToken: string;
  signalIntegrity: string;
  status: "SYNCED" | "CONNECTING" | "DEGRADED";
}

function nowIST() {
  return new Date().toLocaleTimeString("en-IN", {
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
}

export default function MSimTelemetryDashboard() {
  const [data, setData] = useState<TelemetryData>({
    latency: 14,
    lastSync: nowIST(),
    treasuryNode: "UST-NODE-DC-7",
    sessionToken: hexToken(),
    signalIntegrity: "99.4",
    status: "SYNCED",
  });
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setPulse((p) => !p);
      setData({
        latency: randInt(12, 18),
        lastSync: nowIST(),
        treasuryNode: "UST-NODE-DC-7",
        sessionToken: hexToken(),
        signalIntegrity: randFloat(99.1, 99.9),
        status: "SYNCED",
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const statusColor =
    data.status === "SYNCED"
      ? "#22c55e"
      : data.status === "DEGRADED"
        ? "#f97316"
        : "#eab308";

  return (
    <div
      className="mx-4 mt-4 rounded-xl overflow-hidden"
      style={{
        background: VIOLET_CARD,
        border: VIOLET_BORDER,
        borderStyle: "solid",
        borderWidth: "1px",
        boxShadow: "0 0 20px oklch(0.38 0.12 290 / 0.18)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{
          background: "oklch(0.16 0.04 290 / 0.6)",
          borderBottom: VIOLET_BORDER,
          borderBottomStyle: "solid",
          borderBottomWidth: "1px",
        }}
      >
        <div>
          <p
            className="text-[10px] font-mono font-bold tracking-widest"
            style={{ color: VIOLET_ACCENT }}
          >
            M.SIM TELEMETRY DASHBOARD
          </p>
          <p
            className="text-[9px] font-mono"
            style={{ color: "oklch(0.45 0.08 290)" }}
          >
            HARDWARE HANDSHAKE STATUS · v24
          </p>
        </div>
        <span
          className="text-[8px] font-mono px-2 py-0.5 rounded-full"
          style={{
            background: "oklch(0.22 0.08 290 / 0.4)",
            border: VIOLET_BORDER,
            borderStyle: "solid",
            borderWidth: "1px",
            color: VIOLET_ACCENT,
          }}
        >
          DEMO
        </span>
      </div>

      <div className="px-4 py-3">
        {/* Large status indicator */}
        <div className="flex items-center gap-4 mb-3">
          {/* Pulsing indicator */}
          <div
            className="relative flex-shrink-0"
            style={{ width: 52, height: 52 }}
          >
            {/* Outer pulse ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${statusColor}`,
                opacity: pulse ? 0.3 : 0.7,
                transition: "opacity 1.5s ease",
                transform: pulse ? "scale(1.25)" : "scale(1)",
                transitionProperty: "opacity, transform",
                transitionDuration: "1.5s",
              }}
            />
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{
                background: `${statusColor}22`,
                border: `2px solid ${statusColor}`,
              }}
            >
              <div
                className="w-5 h-5 rounded-full"
                style={{
                  background: statusColor,
                  boxShadow: `0 0 12px ${statusColor}`,
                  animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
                }}
              />
            </div>
          </div>

          <div>
            <p
              className="text-sm font-mono font-bold"
              style={{ color: statusColor }}
            >
              {data.status === "SYNCED" ? "● GREEN LIGHT" : data.status}
            </p>
            <p
              className="text-[10px] font-mono"
              style={{ color: "oklch(0.65 0.1 290)" }}
            >
              HARDWARE HANDSHAKE: ACTIVE
            </p>
            <p
              className="text-[10px] font-mono"
              style={{ color: "oklch(0.65 0.1 290)" }}
            >
              US TREASURY NODE: {data.status}
            </p>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Handshake Latency", value: `${data.latency} ms` },
            { label: "Last Sync", value: data.lastSync },
            { label: "Treasury Node", value: data.treasuryNode },
            { label: "Signal Integrity", value: `${data.signalIntegrity}%` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg px-2.5 py-2"
              style={{
                background: "oklch(0.11 0.02 290)",
                border: "1px solid oklch(0.25 0.07 290 / 0.4)",
              }}
            >
              <p
                className="text-[9px] font-mono"
                style={{ color: "oklch(0.45 0.08 290)" }}
              >
                {label}
              </p>
              <p
                className="text-[11px] font-mono font-bold mt-0.5"
                style={{ color: VIOLET_ACCENT }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Session token */}
        <div
          className="mt-2 rounded-lg px-2.5 py-1.5"
          style={{
            background: "oklch(0.11 0.02 290)",
            border: "1px solid oklch(0.25 0.07 290 / 0.4)",
          }}
        >
          <p
            className="text-[9px] font-mono"
            style={{ color: "oklch(0.45 0.08 290)" }}
          >
            Session Token
          </p>
          <p
            className="text-[10px] font-mono font-bold tracking-widest mt-0.5"
            style={{ color: "oklch(0.55 0.12 290)" }}
          >
            {data.sessionToken.toUpperCase()}
          </p>
        </div>

        <p
          className="mt-2 text-[9px] font-mono text-center"
          style={{ color: "oklch(0.38 0.06 290)" }}
        >
          Confirms physical sync between your device and US Treasury node
        </p>
      </div>
    </div>
  );
}
