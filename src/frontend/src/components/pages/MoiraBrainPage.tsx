import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Eye,
  Fingerprint,
  Globe,
  Loader2,
  Lock,
  OctagonX,
  Radio,
  RefreshCw,
  Satellite,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AVEVAPredictiveLayer from "../AVEVAPredictiveLayer";
import KillSwitchRecovery from "../KillSwitchRecovery";

// ── Types ─────────────────────────────────────────────────────

type PingStatus = "READY" | "CHECKING" | "FAULT";

type RfidStatus = "idle" | "scanning" | "authenticated";

interface IntegrityMetric {
  id: string;
  label: string;
  score: number;
}

interface OracleTelemetry {
  threatLevel: string;
  anomalyScore: number;
  vaultIntegrity: number;
  lastUpdated: string;
}

interface SanchaarAuth {
  certStatus: string;
  aadhaarBridge: string;
  kycLayer: string;
  lastUpdated: string;
}

interface Web3Node {
  id: string;
  nodeId: string;
  shardId: string;
  chain: string;
  status: string;
  lastVerified: string;
}

interface BridgeEvent {
  id: string;
  from: string;
  to: string;
  amount: string;
  status: string;
  time: string;
}

interface SyncEvent {
  id: string;
  time: string;
  message: string;
}

interface SystemComponent {
  id: string;
  label: string;
  status: PingStatus;
  lastPingSeconds: number;
}

interface HealingLogEntry {
  id: string;
  message: string;
  timestamp: string;
}

interface SyncPacket {
  id: string;
  time: string;
  region: string;
  version: string;
  status: "SYNCED";
}

// ── Helpers ────────────────────────────────────────────────────

function randomStatus(): PingStatus {
  const r = Math.random();
  if (r < 0.9) return "READY";
  if (r < 0.97) return "CHECKING";
  return "FAULT";
}

function genHex(len: number): string {
  return Array.from({ length: len }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}

function nowTime(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 8);
}

function randomVersion(): string {
  return `v${Math.floor(Math.random() * 9) + 1}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 9)}`;
}

const REGIONS = ["US-EAST", "US-WEST", "US-CENTRAL", "US-GOV", "US-FINANCIAL"];
const COMPONENTS: string[] = [
  "MOIRA_CORE",
  "VAULT_SECURE",
  "BANK_ENGINE",
  "SENSOR_NET",
  "DATA_RELAY",
  "AUTH_SHIELD",
];

const SEED_HEALING: HealingLogEntry[] = [
  {
    id: "h1",
    message: "Memory leak patched — moira_core",
    timestamp: "03:14:22",
  },
  {
    id: "h2",
    message: "Cache restored — vault_module",
    timestamp: "03:18:47",
  },
  { id: "h3", message: "Auth token refreshed", timestamp: "03:22:05" },
  { id: "h4", message: "Session buffer cleared", timestamp: "03:31:58" },
];

const TAMPER_LOG = [
  "Unauthorised process detected — blocked (2026-03-01)",
  "Uninstall attempt intercepted — logged (2026-03-02)",
];

// ── New pillar helpers ─────────────────────────────────────────

const INTEGRITY_METRICS_LABELS = [
  "CPU_INTEGRITY",
  "MEM_SHIELD",
  "NET_FENCE",
  "AUTH_GATE",
  "VAULT_CORE",
  "BRAIN_NODE",
];

function randomIntegrity(): number {
  return 90 + Math.floor(Math.random() * 10);
}

function randomThreatLevel(): string {
  const levels = ["LOW", "LOW", "LOW", "MINIMAL", "NOMINAL"];
  return levels[Math.floor(Math.random() * levels.length)];
}

function randomAnomalyScore(): number {
  return Number.parseFloat((Math.random() * 0.04).toFixed(3));
}

function randomVaultIntegrity(): number {
  return Number.parseFloat((99.5 + Math.random() * 0.5).toFixed(1));
}

const WEB3_NODES: Web3Node[] = [
  {
    id: "n1",
    nodeId: "ICP_NODE_1",
    shardId: "0xa3f9",
    chain: "ICP",
    status: "SECURED",
    lastVerified: "2s ago",
  },
  {
    id: "n2",
    nodeId: "ICP_NODE_2",
    shardId: "0xb72c",
    chain: "ICP",
    status: "SECURED",
    lastVerified: "5s ago",
  },
  {
    id: "n3",
    nodeId: "ICP_NODE_3",
    shardId: "0xd41e",
    chain: "ICP",
    status: "SECURED",
    lastVerified: "8s ago",
  },
  {
    id: "n4",
    nodeId: "ICP_NODE_4",
    shardId: "0xe90a",
    chain: "ICP",
    status: "SECURED",
    lastVerified: "12s ago",
  },
  {
    id: "n5",
    nodeId: "ICP_NODE_5",
    shardId: "0xf1d6",
    chain: "ICP",
    status: "SECURED",
    lastVerified: "15s ago",
  },
];

const SEED_BRIDGE_EVENTS: BridgeEvent[] = [
  {
    id: "b1",
    from: "ICP",
    to: "ETH",
    amount: "₹2.4L",
    status: "CONFIRMED",
    time: "03:44:12",
  },
  {
    id: "b2",
    from: "ICP",
    to: "BTC",
    amount: "₹1.8L",
    status: "CONFIRMED",
    time: "03:41:05",
  },
  {
    id: "b3",
    from: "ETH",
    to: "ICP",
    amount: "₹5.2L",
    status: "CONFIRMED",
    time: "03:38:47",
  },
];

const PROSPERITY_SECTORS = [
  { label: "Technology & AI", jobs: 312, color: "oklch(0.72 0.16 75)" },
  { label: "Banking & Finance", jobs: 198, color: "oklch(0.72 0.18 270)" },
  { label: "Healthcare Innovation", jobs: 157, color: "oklch(0.65 0.16 150)" },
  { label: "Infrastructure & Cloud", jobs: 124, color: "oklch(0.72 0.18 200)" },
  { label: "Trade & Commerce", jobs: 56, color: "oklch(0.65 0.22 15)" },
];

const TOTAL_JOBS_TARGET = 1000;
const INITIAL_JOB_COUNT = 847;

// ── Status dot color helper ────────────────────────────────────

function statusColor(s: PingStatus): string {
  if (s === "READY") return "oklch(0.65 0.16 150)";
  if (s === "CHECKING") return "oklch(0.78 0.12 75)";
  return "oklch(0.65 0.22 15)";
}

// ── Card wrapper ───────────────────────────────────────────────

function PillarCard({
  children,
  accentColor,
}: {
  children: React.ReactNode;
  accentColor: string;
}) {
  return (
    <div
      className="rounded-xl p-3 mb-3"
      style={{
        background: "oklch(0.10 0.015 255)",
        border: `1px solid ${accentColor}40`,
        boxShadow: `0 0 16px ${accentColor}12`,
      }}
    >
      {children}
    </div>
  );
}

function PillarHeader({
  icon: Icon,
  title,
  accentColor,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  accentColor: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}50`,
          }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
        </div>
        <span
          className="text-xs font-mono-code font-bold tracking-widest uppercase"
          style={{ color: accentColor }}
        >
          {title}
        </span>
      </div>
      {badge}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════

interface LostDevice {
  id: string;
  deviceId: string;
  timestamp: string;
}

interface MoiraBrainPageProps {
  inactionActive?: boolean;
  eSimTrust?: "IGNITED" | "RESTRICTED";
  onESimTrustChange?: (trust: "IGNITED" | "RESTRICTED") => void;
}

// ── Compliance Badge ────────────────────────────────────────────
function ComplianceBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono-code font-bold"
      style={{
        background: "oklch(0.65 0.16 150 / 0.12)",
        border: "1px solid oklch(0.65 0.16 150 / 0.3)",
        color: "oklch(0.65 0.16 150)",
      }}
    >
      <span>✓</span>
      <span>262626</span>
    </span>
  );
}

// ── Embedded SDK Console ─────────────────────────────────────────
const SDK_DEVICES = [
  {
    id: "IoT-AGRI-NODE-001",
    type: "IoT",
    latency: "0.34ms",
    status: "ACTIVE" as const,
    cipher: "AES-256+Kyber",
  },
  {
    id: "EV-CHARGE-STATION-007",
    type: "EV",
    latency: "0.51ms",
    status: "PENDING" as const,
    cipher: "AES-256+Kyber",
  },
  {
    id: "INDUSTRIAL-CNC-042",
    type: "Industrial",
    latency: "0.28ms",
    status: "ACTIVE" as const,
    cipher: "AES-256+Kyber",
  },
];

function EmbeddedSDKConsole() {
  const [heartbeats, setHeartbeats] = React.useState<Record<string, boolean>>(
    {},
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      const id = SDK_DEVICES[Math.floor(Math.random() * SDK_DEVICES.length)].id;
      setHeartbeats((prev) => ({ ...prev, [id]: true }));
      setTimeout(
        () => setHeartbeats((prev) => ({ ...prev, [id]: false })),
        400,
      );
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="mx-3 mt-3 rounded-xl overflow-hidden"
      style={{
        border: "1px solid oklch(0.6 0.18 200 / 0.4)",
        background: "oklch(0.10 0.02 200 / 0.4)",
      }}
    >
      <div
        className="flex items-center justify-between gap-2 px-3 py-2.5 border-b"
        style={{ borderColor: "oklch(0.22 0.025 255)" }}
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4" style={{ color: "oklch(0.6 0.18 200)" }} />
          <div>
            <p
              className="text-xs font-display font-bold"
              style={{ color: "oklch(0.75 0.12 200)" }}
            >
              EMBEDDED SDK — MANUFACTURER INTEGRATION CONSOLE
            </p>
            <p
              className="text-[9px] font-mono-code"
              style={{ color: "oklch(0.5 0.08 200)" }}
            >
              sdk.moira.nwos.ai/v1/hardware · DEMO
            </p>
          </div>
        </div>
        <ComplianceBadge />
      </div>
      <div className="p-3 space-y-2">
        {SDK_DEVICES.map((dev) => (
          <div
            key={dev.id}
            data-ocid="brain.sdk.device.card"
            className="rounded-lg px-3 py-2.5 flex items-center justify-between"
            style={{
              background: "oklch(0.14 0.022 255)",
              border: "1px solid oklch(0.24 0.028 255)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300"
                style={{
                  background: heartbeats[dev.id]
                    ? "oklch(0.75 0.18 150)"
                    : dev.status === "ACTIVE"
                      ? "oklch(0.65 0.16 150)"
                      : "oklch(0.78 0.12 75)",
                  boxShadow: heartbeats[dev.id]
                    ? "0 0 6px oklch(0.75 0.18 150)"
                    : "none",
                }}
              />
              <div>
                <p
                  className="text-[10px] font-mono-code font-bold"
                  style={{ color: "oklch(0.78 0.06 255)" }}
                >
                  {dev.id}
                </p>
                <p
                  className="text-[9px] font-body"
                  style={{ color: "oklch(0.5 0.04 255)" }}
                >
                  {dev.cipher} · Latency: {dev.latency}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[8px] font-mono-code px-1.5 py-0.5 rounded"
                style={{
                  background:
                    dev.status === "ACTIVE"
                      ? "oklch(0.65 0.16 150 / 0.12)"
                      : "oklch(0.78 0.12 75 / 0.12)",
                  color:
                    dev.status === "ACTIVE"
                      ? "oklch(0.65 0.16 150)"
                      : "oklch(0.78 0.12 75)",
                  border: `1px solid ${dev.status === "ACTIVE" ? "oklch(0.65 0.16 150 / 0.3)" : "oklch(0.78 0.12 75 / 0.3)"}`,
                }}
              >
                {dev.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Hardware Tunnel Monitor ──────────────────────────────────────
function generateTunnelEvent() {
  const devices = [
    "IoT-AGRI-NODE-001",
    "EV-CHARGE-007",
    "CNC-042",
    "EV-FLEET-012",
    "AGRI-SENSOR-88",
  ];
  const statuses = ["SETTLED", "SETTLED", "SETTLED", "PENDING"] as const;
  const dev = devices[Math.floor(Math.random() * devices.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const hash = Math.random().toString(16).slice(2, 10).toUpperCase();
  const lat = `${(Math.random() * 0.4 + 0.1).toFixed(2)}ms`;
  const ts = new Date().toTimeString().slice(0, 8);
  return { dev, hash, lat, status, ts };
}

interface TunnelEvent {
  id: string;
  dev: string;
  hash: string;
  lat: string;
  status: "SETTLED" | "PENDING";
  ts: string;
}

function HardwareTunnelMonitor() {
  const [events, setEvents] = React.useState<TunnelEvent[]>(() =>
    Array.from({ length: 6 }, (_, i) => ({
      ...generateTunnelEvent(),
      id: String(i),
    })),
  );
  const [handshakes, setHandshakes] = React.useState(14382);
  const [totalSettled, setTotalSettled] = React.useState(9821);
  const [avgLatency] = React.useState("0.31ms");

  React.useEffect(() => {
    const interval = setInterval(() => {
      const newEvent: TunnelEvent = {
        ...generateTunnelEvent(),
        id: String(Date.now()),
      };
      setEvents((prev) => [newEvent, ...prev].slice(0, 8));
      setHandshakes((h) => h + 1);
      if (newEvent.status === "SETTLED") setTotalSettled((t) => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="mx-3 mt-3 rounded-xl overflow-hidden"
      style={{
        border: "1px solid oklch(0.72 0.16 55 / 0.4)",
        background: "oklch(0.10 0.015 55 / 0.3)",
      }}
    >
      <div
        className="flex items-center justify-between gap-2 px-3 py-2.5 border-b"
        style={{ borderColor: "oklch(0.22 0.025 255)" }}
      >
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4" style={{ color: "oklch(0.72 0.16 55)" }} />
          <div>
            <p
              className="text-xs font-display font-bold"
              style={{ color: "oklch(0.82 0.12 55)" }}
            >
              HARDWARE TUNNEL MONITOR — ENCRYPTED SETTLEMENT FEED
            </p>
            <p
              className="text-[9px] font-mono-code"
              style={{ color: "oklch(0.5 0.08 55)" }}
            >
              AES-256-GCM + Kyber-1024 · DEMO
            </p>
          </div>
        </div>
        <ComplianceBadge />
      </div>
      {/* Stats row */}
      <div
        className="grid grid-cols-3 gap-2 px-3 py-2 border-b"
        style={{ borderColor: "oklch(0.22 0.025 255)" }}
      >
        {[
          { label: "Handshakes", value: handshakes.toLocaleString() },
          { label: "Settled Today", value: totalSettled.toLocaleString() },
          { label: "Avg Latency", value: avgLatency },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p
              className="text-sm font-mono-code font-bold"
              style={{ color: "oklch(0.72 0.16 55)" }}
            >
              {value}
            </p>
            <p
              className="text-[8px] font-body"
              style={{ color: "oklch(0.5 0.04 255)" }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>
      {/* Event feed */}
      <div className="overflow-hidden max-h-44 px-3 py-2 space-y-1">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="flex items-center gap-2 text-[9px] font-mono-code py-1 border-b last:border-0"
            style={{ borderColor: "oklch(0.18 0.02 255)" }}
          >
            <span style={{ color: "oklch(0.45 0.04 255)", minWidth: 52 }}>
              {ev.ts}
            </span>
            <span
              className="flex-1 truncate"
              style={{ color: "oklch(0.65 0.08 200)" }}
            >
              {ev.dev}
            </span>
            <span style={{ color: "oklch(0.55 0.06 255)" }}>#{ev.hash}</span>
            <span style={{ color: "oklch(0.6 0.1 200)" }}>{ev.lat}</span>
            <span
              className="px-1.5 py-0.5 rounded"
              style={{
                background:
                  ev.status === "SETTLED"
                    ? "oklch(0.65 0.16 150 / 0.12)"
                    : "oklch(0.78 0.12 75 / 0.12)",
                color:
                  ev.status === "SETTLED"
                    ? "oklch(0.65 0.16 150)"
                    : "oklch(0.78 0.12 75)",
              }}
            >
              {ev.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MoiraBrainPage({
  inactionActive = false,
  eSimTrust = "IGNITED",
  onESimTrustChange,
}: MoiraBrainPageProps) {
  // ── Uptime counter ─────────────────────────────────────────
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setUptimeSeconds(Math.floor((Date.now() - mountTime.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── 1. Autonomous Health Pings ─────────────────────────────
  const [components, setComponents] = useState<SystemComponent[]>(
    COMPONENTS.map((label) => ({
      id: label,
      label,
      status: "READY",
      lastPingSeconds: Math.floor(Math.random() * 5),
    })),
  );
  const [pingRunning, setPingRunning] = useState(false);

  const refreshPings = useCallback(() => {
    setComponents((prev) =>
      prev.map((c) => ({
        ...c,
        status: randomStatus(),
        lastPingSeconds: 0,
      })),
    );
  }, []);

  // Auto-refresh every 3s
  useEffect(() => {
    const id = setInterval(() => {
      setComponents((prev) =>
        prev.map((c) => ({
          ...c,
          status: randomStatus(),
          lastPingSeconds: c.lastPingSeconds + 3,
        })),
      );
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const handleFullPing = () => {
    if (inactionActive) return;
    setPingRunning(true);
    refreshPings();
    // health event logged
    setTimeout(() => setPingRunning(false), 800);
  };

  // ── 2. Self-Healing Toolkit ────────────────────────────────
  const [healingLog, setHealingLog] = useState<HealingLogEntry[]>(SEED_HEALING);
  const [diagRunning, setDiagRunning] = useState(false);

  const handleRunDiagnostics = () => {
    if (inactionActive) return;
    setDiagRunning(true);
    // health event logged
    setTimeout(() => {
      setHealingLog((prev) => [
        {
          id: `diag-${Date.now()}`,
          message: "Diagnostics complete — all systems nominal",
          timestamp: nowTime(),
        },
        ...prev,
      ]);
      setDiagRunning(false);
    }, 2000);
  };

  const handleRestoreDefault = () => {
    if (inactionActive) return;
    // health event logged
    setHealingLog((prev) => [
      {
        id: `restore-${Date.now()}`,
        message: "Default state restored — configuration reset to baseline",
        timestamp: nowTime(),
      },
      ...prev,
    ]);
  };

  // ── 3. Criminal Liability Shield ──────────────────────────
  const [integrityHash, setIntegrityHash] = useState(() => genHex(32));
  const [verifiedFlash, setVerifiedFlash] = useState(false);

  const handleVerifyIntegrity = () => {
    if (inactionActive) return;
    const newHash = genHex(32);
    setIntegrityHash(newHash);
    setVerifiedFlash(true);
    // health event logged
    setTimeout(() => setVerifiedFlash(false), 1500);
  };

  // ── 4. Energy Optimization ────────────────────────────────
  const [brainPriority, setBrainPriority] = useState(true);
  const [batteryPct, setBatteryPct] = useState(87);

  useEffect(() => {
    const id = setInterval(() => {
      setBatteryPct((prev) => (prev > 20 ? prev - 1 : prev));
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const handleEnergyToggle = (checked: boolean) => {
    setBrainPriority(checked);
    // health event logged
  };

  // ── 5. Priority Global Data ────────────────────────────────
  const [syncPackets, setSyncPackets] = useState<SyncPacket[]>(() => {
    const now = new Date();
    return REGIONS.slice(0, 4).map((region, i) => {
      const t = new Date(now.getTime() - (4 - i) * 4000);
      return {
        id: `init-${i}`,
        time: t.toTimeString().slice(0, 8),
        region,
        version: randomVersion(),
        status: "SYNCED" as const,
      };
    });
  });
  const regionIndex = useRef(0);

  const addPacket = useCallback(() => {
    const region = REGIONS[regionIndex.current % REGIONS.length];
    regionIndex.current++;
    const packet: SyncPacket = {
      id: `pkt-${Date.now()}`,
      time: nowTime(),
      region,
      version: randomVersion(),
      status: "SYNCED",
    };
    setSyncPackets((prev) => [packet, ...prev].slice(0, 12));
  }, []);

  useEffect(() => {
    const id = setInterval(addPacket, 4000);
    return () => clearInterval(id);
  }, [addPacket]);

  const handleForceSync = () => {
    if (inactionActive) return;
    addPacket();
    // health event logged
  };

  // ══════════════════════════════════════════════════════════════
  // NEW PILLAR STATE
  // ══════════════════════════════════════════════════════════════

  // ── PILLAR 6 — 3rd Eye Ignition ──────────────────────────────
  const [thirdEyeActive, setThirdEyeActive] = useState(false);

  // ── PILLAR 7 — Virtual RFID ──────────────────────────────────
  const [rfidStatus, setRfidStatus] = useState<RfidStatus>("idle");
  const handleRfidScan = () => {
    if (rfidStatus === "scanning") return;
    setRfidStatus("scanning");
    setTimeout(() => setRfidStatus("authenticated"), 2500);
  };

  // ── PILLAR 8 — Emergency Bank Mode ───────────────────────────
  const [emergencyBankOn, setEmergencyBankOn] = useState(false);
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([
    {
      id: "s0",
      time: nowTime(),
      message: "Cache initialized — 47 transactions loaded",
    },
    {
      id: "s1",
      time: nowTime(),
      message: "Encryption verified — AES-256 active",
    },
    {
      id: "s2",
      time: nowTime(),
      message: "MOIRA Vault offline mode engaged",
    },
  ]);

  const addSyncEvent = useCallback(() => {
    const msgs = [
      "Sync pulse — all shards nominal",
      "Cache snapshot saved",
      "Integrity check passed",
      "Offline delta compressed",
      "Vault key rotation complete",
    ];
    setSyncEvents((prev) =>
      [
        {
          id: `sync-${Date.now()}`,
          time: nowTime(),
          message: msgs[Math.floor(Math.random() * msgs.length)],
        },
        ...prev,
      ].slice(0, 8),
    );
  }, []);

  useEffect(() => {
    if (!emergencyBankOn) return;
    const id = setInterval(addSyncEvent, 8000);
    return () => clearInterval(id);
  }, [emergencyBankOn, addSyncEvent]);

  const handleForceVaultSync = () => {
    addSyncEvent();
  };

  // ── PILLAR 9 — Cell Invader & Self-Healing ───────────────────
  const [integrityMetrics, setIntegrityMetrics] = useState<IntegrityMetric[]>(
    INTEGRITY_METRICS_LABELS.map((label) => ({
      id: label,
      label,
      score: randomIntegrity(),
    })),
  );
  const [cellInvaderBlocking, setCellInvaderBlocking] = useState(false);

  useEffect(() => {
    const metricId = setInterval(() => {
      setIntegrityMetrics((prev) =>
        prev.map((m) => ({ ...m, score: randomIntegrity() })),
      );
    }, 5000);
    const invaderFlashId = setInterval(() => {
      setCellInvaderBlocking(true);
      setTimeout(() => setCellInvaderBlocking(false), 1200);
    }, 15000);
    return () => {
      clearInterval(metricId);
      clearInterval(invaderFlashId);
    };
  }, []);

  // ── PILLAR 10 — Unified Security Command ─────────────────────
  const [oracleTelemetry, setOracleTelemetry] = useState<OracleTelemetry>({
    threatLevel: "LOW",
    anomalyScore: 0.012,
    vaultIntegrity: 99.8,
    lastUpdated: nowTime(),
  });
  const [sancharAuth, setSancharAuth] = useState<SanchaarAuth>({
    certStatus: "VALID",
    aadhaarBridge: "ACTIVE",
    kycLayer: "VERIFIED",
    lastUpdated: nowTime(),
  });

  useEffect(() => {
    const oracleId = setInterval(() => {
      setOracleTelemetry({
        threatLevel: randomThreatLevel(),
        anomalyScore: randomAnomalyScore(),
        vaultIntegrity: randomVaultIntegrity(),
        lastUpdated: nowTime(),
      });
    }, 3000);
    const sancharId = setInterval(() => {
      setSancharAuth({
        certStatus: "VALID",
        aadhaarBridge: "ACTIVE",
        kycLayer: "VERIFIED",
        lastUpdated: nowTime(),
      });
    }, 4000);
    return () => {
      clearInterval(oracleId);
      clearInterval(sancharId);
    };
  }, []);

  const absolutePeace =
    oracleTelemetry.threatLevel !== "HIGH" &&
    oracleTelemetry.anomalyScore < 0.1 &&
    sancharAuth.certStatus === "VALID" &&
    sancharAuth.kycLayer === "VERIFIED";

  // ── PILLAR 11 — Web3 Sovereign Vault ─────────────────────────
  const [bridgeEvents, setBridgeEvents] =
    useState<BridgeEvent[]>(SEED_BRIDGE_EVENTS);
  const BRIDGE_TARGETS = ["ETH", "BTC", "SOL", "ICP"];
  const bridgeAmounts = ["₹1.2L", "₹3.6L", "₹2.4L", "₹4.1L", "₹0.8L"];

  useEffect(() => {
    const id = setInterval(() => {
      const from = "ICP";
      const to =
        BRIDGE_TARGETS[Math.floor(Math.random() * BRIDGE_TARGETS.length)];
      const amount =
        bridgeAmounts[Math.floor(Math.random() * bridgeAmounts.length)];
      setBridgeEvents((prev) =>
        [
          {
            id: `bridge-${Date.now()}`,
            from,
            to,
            amount,
            status: "CONFIRMED",
            time: nowTime(),
          },
          ...prev,
        ].slice(0, 8),
      );
    }, 7000);
    return () => clearInterval(id);
  }, []);

  // ── PILLAR 12 — Economic Metric ──────────────────────────────
  const [jobCount, setJobCount] = useState(INITIAL_JOB_COUNT);

  useEffect(() => {
    const id = setInterval(() => {
      setJobCount((prev) => {
        const next = prev + Math.floor(Math.random() * 3);
        return next > TOTAL_JOBS_TARGET ? TOTAL_JOBS_TARGET : next;
      });
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // ── PILLAR 13 — Device Trust Simulator ───────────────────────
  const [lostDeviceInput, setLostDeviceInput] = useState("");
  const [lostDevices, setLostDevices] = useState<LostDevice[]>([]);

  const handleDeviceTrustToggle = () => {
    if (!onESimTrustChange) return;
    const next = eSimTrust === "IGNITED" ? "RESTRICTED" : "IGNITED";
    onESimTrustChange(next);
    // health event logged
  };

  const handleLostDeviceReport = () => {
    if (!lostDeviceInput.trim()) return;
    const deviceId = lostDeviceInput.trim();
    const now = new Date();
    const timestamp = now.toTimeString().slice(0, 8);
    setLostDevices((prev) => [
      { id: `ld-${Date.now()}`, deviceId, timestamp },
      ...prev,
    ]);
    setLostDeviceInput("");
    toast.warning(
      `Device ID ${deviceId} flagged — Account access suspended (demo)`,
      { duration: 4000 },
    );
    // health event logged
  };

  // ── Render ─────────────────────────────────────────────────

  const uptimeStr = `${String(Math.floor(uptimeSeconds / 3600)).padStart(2, "0")}:${String(Math.floor((uptimeSeconds % 3600) / 60)).padStart(2, "0")}:${String(uptimeSeconds % 60).padStart(2, "0")}`;

  return (
    <div
      className="min-h-full pb-4"
      style={{ background: "oklch(0.09 0.013 255)" }}
    >
      {/* ── Inaction Safety Banner ──────────────────────────── */}
      {inactionActive && (
        <div
          className="flex items-center gap-2 px-3 py-2 text-[10px] font-mono-code font-bold uppercase tracking-widest sticky top-0 z-20"
          style={{
            background: "oklch(0.13 0.03 20 / 0.95)",
            borderBottom: "1px solid oklch(0.62 0.2 18 / 0.5)",
            color: "oklch(0.75 0.18 18)",
          }}
        >
          <OctagonX className="w-3 h-3 flex-shrink-0" />
          Inaction Safety engaged — brain actions locked
        </div>
      )}
      {/* ── Page Header ──────────────────────────────────────── */}
      <motion.div
        className="sticky top-0 z-10 px-4 py-3 border-b"
        animate={
          thirdEyeActive
            ? {
                boxShadow: [
                  "0 0 12px oklch(0.72 0.22 270 / 0.4), inset 0 0 8px oklch(0.72 0.22 270 / 0.08)",
                  "0 0 28px oklch(0.72 0.22 270 / 0.7), inset 0 0 16px oklch(0.72 0.22 270 / 0.14)",
                  "0 0 12px oklch(0.72 0.22 270 / 0.4), inset 0 0 8px oklch(0.72 0.22 270 / 0.08)",
                ],
              }
            : { boxShadow: "none" }
        }
        transition={
          thirdEyeActive
            ? {
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }
            : { duration: 0.3 }
        }
        style={{
          background: thirdEyeActive
            ? "oklch(0.12 0.025 270)"
            : "oklch(0.10 0.015 255)",
          borderColor: thirdEyeActive
            ? "oklch(0.55 0.22 270 / 0.6)"
            : "oklch(0.55 0.18 220 / 0.3)",
          transition: "background 0.4s ease, border-color 0.4s ease",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 8px oklch(0.65 0.2 220 / 0.4)",
                  "0 0 18px oklch(0.65 0.2 220 / 0.7)",
                  "0 0 8px oklch(0.65 0.2 220 / 0.4)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "oklch(0.18 0.06 220)",
                border: "1px solid oklch(0.55 0.18 220 / 0.6)",
              }}
            >
              <BrainCircuit
                className="w-4 h-4"
                style={{ color: "oklch(0.72 0.2 220)" }}
              />
            </motion.div>
            <div>
              <div
                className="text-xs font-mono-code font-black tracking-[0.2em] uppercase leading-none"
                style={{ color: "oklch(0.72 0.2 220)" }}
              >
                MOIRA BRAIN
              </div>
              <div
                className="text-[9px] font-mono-code tracking-widest leading-none mt-0.5"
                style={{ color: "oklch(0.5 0.08 220)" }}
              >
                SECURITY & MAINTENANCE
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Uptime */}
            <div
              className="px-2 py-1 rounded-md flex items-center gap-1"
              style={{
                background: "oklch(0.14 0.025 150 / 0.5)",
                border: "1px solid oklch(0.45 0.14 150 / 0.3)",
              }}
            >
              <Activity
                className="w-2.5 h-2.5"
                style={{ color: "oklch(0.65 0.16 150)" }}
              />
              <span
                className="text-[9px] font-mono-code font-bold tabular-nums"
                style={{ color: "oklch(0.65 0.16 150)" }}
              >
                {uptimeStr}
              </span>
            </div>
            <Badge
              className="text-[9px] font-mono-code px-1.5 py-0.5 rounded-md"
              style={{
                background: "oklch(0.18 0.06 150 / 0.5)",
                border: "1px solid oklch(0.55 0.16 150 / 0.4)",
                color: "oklch(0.72 0.18 150)",
              }}
            >
              ONLINE
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="px-3 pt-3 space-y-0">
        {/* ════════════════════════════════════════════════════
            PILLAR 1 — AUTONOMOUS HEALTH PINGS
        ════════════════════════════════════════════════════ */}
        <PillarCard accentColor="oklch(0.65 0.2 220)">
          <PillarHeader
            icon={Activity}
            title="Autonomous Health Pings"
            accentColor="oklch(0.65 0.2 220)"
            badge={
              <Button
                size="sm"
                data-ocid="brain.health_pings.button"
                onClick={handleFullPing}
                disabled={pingRunning}
                className="h-6 px-2 text-[10px] font-mono-code rounded-md"
                style={{
                  background: "oklch(0.18 0.06 220 / 0.8)",
                  border: "1px solid oklch(0.55 0.18 220 / 0.5)",
                  color: "oklch(0.72 0.2 220)",
                }}
              >
                {pingRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                <span className="ml-1">Run Full Ping</span>
              </Button>
            }
          />
          <div className="space-y-1.5">
            {components.map((comp) => (
              <motion.div
                key={comp.id}
                layout
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg"
                style={{
                  background: "oklch(0.13 0.02 255)",
                  border: "1px solid oklch(0.22 0.025 255)",
                }}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: statusColor(comp.status) }}
                    animate={
                      comp.status === "CHECKING" ? { opacity: [1, 0.3, 1] } : {}
                    }
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                  <span
                    className="text-[10px] font-mono-code font-semibold tracking-wider"
                    style={{ color: "oklch(0.75 0.04 255)" }}
                  >
                    {comp.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] font-mono-code"
                    style={{ color: "oklch(0.45 0.03 255)" }}
                  >
                    {comp.lastPingSeconds}s ago
                  </span>
                  <span
                    className="text-[9px] font-mono-code font-bold px-1.5 py-0.5 rounded"
                    style={{
                      background: `${statusColor(comp.status)}18`,
                      color: statusColor(comp.status),
                      border: `1px solid ${statusColor(comp.status)}40`,
                    }}
                  >
                    {comp.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </PillarCard>

        {/* ════════════════════════════════════════════════════
            PILLAR 2 — SELF-HEALING TOOLKIT
        ════════════════════════════════════════════════════ */}
        <PillarCard accentColor="oklch(0.65 0.16 150)">
          <PillarHeader
            icon={Wrench}
            title="Self-Healing Toolkit"
            accentColor="oklch(0.65 0.16 150)"
            badge={
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{
                  background: "oklch(0.15 0.04 150 / 0.6)",
                  border: "1px solid oklch(0.45 0.14 150 / 0.5)",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "oklch(0.65 0.16 150)" }}
                />
                <span
                  className="text-[9px] font-mono-code font-bold tracking-widest"
                  style={{ color: "oklch(0.65 0.16 150)" }}
                >
                  TOOLKIT ACTIVE
                </span>
              </div>
            }
          />
          {/* Log */}
          <div
            className="rounded-lg p-2 mb-2 font-mono-code"
            style={{
              background: "oklch(0.07 0.01 150)",
              border: "1px solid oklch(0.25 0.04 150 / 0.4)",
              maxHeight: "100px",
              overflowY: "auto",
            }}
          >
            <AnimatePresence initial={false}>
              {healingLog.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2 items-start py-0.5"
                >
                  <span
                    className="text-[9px] flex-shrink-0"
                    style={{ color: "oklch(0.4 0.06 150)" }}
                  >
                    [{entry.timestamp}]
                  </span>
                  <span
                    className="text-[9px] leading-relaxed"
                    style={{ color: "oklch(0.6 0.12 150)" }}
                  >
                    {entry.message}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              data-ocid="brain.self_healing.run_diagnostics.button"
              onClick={handleRunDiagnostics}
              disabled={diagRunning}
              className="flex-1 h-7 text-[10px] font-mono-code rounded-lg"
              style={{
                background: "oklch(0.18 0.05 150 / 0.8)",
                border: "1px solid oklch(0.45 0.14 150 / 0.5)",
                color: "oklch(0.65 0.16 150)",
              }}
            >
              {diagRunning ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  Scanning…
                </>
              ) : (
                <>
                  <Activity className="w-3 h-3 mr-1" />
                  Run Diagnostics
                </>
              )}
            </Button>
            <Button
              size="sm"
              data-ocid="brain.self_healing.restore.button"
              onClick={handleRestoreDefault}
              className="flex-1 h-7 text-[10px] font-mono-code rounded-lg"
              style={{
                background: "oklch(0.15 0.03 255 / 0.8)",
                border: "1px solid oklch(0.35 0.04 255 / 0.5)",
                color: "oklch(0.6 0.04 255)",
              }}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Restore Default
            </Button>
          </div>
        </PillarCard>

        {/* ════════════════════════════════════════════════════
            PILLAR 3 — CRIMINAL LIABILITY SHIELD
        ════════════════════════════════════════════════════ */}
        <PillarCard accentColor="oklch(0.65 0.22 15)">
          <PillarHeader
            icon={ShieldAlert}
            title="Tamper Protection Active"
            accentColor="oklch(0.65 0.22 15)"
            badge={
              <Shield
                className="w-4 h-4"
                style={{ color: "oklch(0.65 0.22 15)" }}
              />
            }
          />
          {/* Integrity hash */}
          <div
            className="rounded-lg p-2.5 mb-2"
            style={{
              background: "oklch(0.09 0.02 20)",
              border: "1px solid oklch(0.35 0.1 20 / 0.4)",
            }}
          >
            <div
              className="text-[9px] font-mono-code mb-1 tracking-widest uppercase"
              style={{ color: "oklch(0.5 0.1 20)" }}
            >
              System Integrity Hash
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-mono-code font-bold tracking-wider flex-1 break-all"
                style={{ color: "oklch(0.7 0.16 20)" }}
              >
                {integrityHash}
              </span>
              <AnimatePresence>
                {verifiedFlash && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded"
                    style={{
                      background: "oklch(0.15 0.04 150)",
                      border: "1px solid oklch(0.45 0.14 150 / 0.6)",
                    }}
                  >
                    <CheckCircle2
                      className="w-3 h-3"
                      style={{ color: "oklch(0.65 0.16 150)" }}
                    />
                    <span
                      className="text-[9px] font-mono-code font-bold"
                      style={{ color: "oklch(0.65 0.16 150)" }}
                    >
                      VERIFIED
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <Button
            size="sm"
            data-ocid="brain.criminal.verify.button"
            onClick={handleVerifyIntegrity}
            className="w-full h-7 text-[10px] font-mono-code rounded-lg mb-2"
            style={{
              background: "oklch(0.16 0.05 20 / 0.8)",
              border: "1px solid oklch(0.45 0.12 20 / 0.5)",
              color: "oklch(0.7 0.16 20)",
            }}
          >
            <Shield className="w-3 h-3 mr-1" />
            Verify Integrity
          </Button>
          {/* Tamper log */}
          <div
            className="rounded-lg p-2 mb-2"
            style={{
              background: "oklch(0.09 0.02 20)",
              border: "1px solid oklch(0.35 0.1 20 / 0.3)",
            }}
          >
            <div
              className="text-[9px] font-mono-code uppercase tracking-widest mb-1"
              style={{ color: "oklch(0.5 0.1 20)" }}
            >
              Tamper Attempt Log
            </div>
            {TAMPER_LOG.map((entry) => (
              <div key={entry} className="flex items-start gap-1.5 py-0.5">
                <AlertTriangle
                  className="w-2.5 h-2.5 flex-shrink-0 mt-0.5"
                  style={{ color: "oklch(0.78 0.12 75)" }}
                />
                <span
                  className="text-[9px] font-mono-code leading-relaxed"
                  style={{ color: "oklch(0.65 0.08 30)" }}
                >
                  {entry}
                </span>
              </div>
            ))}
          </div>
          {/* Warning */}
          <div
            className="rounded-lg px-2.5 py-2"
            style={{
              background: "oklch(0.12 0.04 20 / 0.6)",
              border: "1px solid oklch(0.55 0.18 25 / 0.3)",
            }}
          >
            <p
              className="text-[9px] font-body leading-relaxed"
              style={{ color: "oklch(0.62 0.1 25)" }}
            >
              ⚠ Any tampering with MOIRA systems constitutes a criminal offence
              under Section 66B of the ITSA.
            </p>
          </div>
        </PillarCard>

        {/* ════════════════════════════════════════════════════
            PILLAR 4 — ENERGY OPTIMIZATION
        ════════════════════════════════════════════════════ */}
        <PillarCard
          accentColor={
            brainPriority ? "oklch(0.65 0.16 150)" : "oklch(0.78 0.12 75)"
          }
        >
          <PillarHeader
            icon={BatteryCharging}
            title="Energy Optimization"
            accentColor={
              brainPriority ? "oklch(0.65 0.16 150)" : "oklch(0.78 0.12 75)"
            }
          />
          {/* Battery bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-[9px] font-mono-code uppercase tracking-widest"
                style={{ color: "oklch(0.5 0.04 255)" }}
              >
                Battery Level
              </span>
              <span
                className="text-xs font-mono-code font-bold tabular-nums"
                style={{
                  color: brainPriority
                    ? "oklch(0.65 0.16 150)"
                    : "oklch(0.78 0.12 75)",
                }}
              >
                {batteryPct}%
              </span>
            </div>
            <div
              className="w-full h-3 rounded-full overflow-hidden"
              style={{
                background: "oklch(0.14 0.02 255)",
                border: "1px solid oklch(0.22 0.025 255)",
              }}
            >
              <motion.div
                animate={{ width: `${batteryPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: brainPriority
                    ? "linear-gradient(90deg, oklch(0.45 0.12 150), oklch(0.65 0.16 150))"
                    : "linear-gradient(90deg, oklch(0.55 0.1 75), oklch(0.78 0.12 75))",
                  boxShadow: brainPriority
                    ? "0 0 8px oklch(0.65 0.16 150 / 0.5)"
                    : "0 0 8px oklch(0.78 0.12 75 / 0.5)",
                }}
              />
            </div>
          </div>
          {/* Mode toggle */}
          <div
            className="flex items-center justify-between p-2.5 rounded-lg"
            style={{
              background: "oklch(0.12 0.018 255)",
              border: "1px solid oklch(0.22 0.025 255)",
            }}
          >
            <div className="flex items-center gap-2">
              <Zap
                className="w-3.5 h-3.5"
                style={{
                  color: brainPriority
                    ? "oklch(0.65 0.16 150)"
                    : "oklch(0.78 0.12 75)",
                }}
              />
              <div>
                <div
                  className="text-[10px] font-mono-code font-bold"
                  style={{ color: "oklch(0.75 0.04 255)" }}
                >
                  {brainPriority ? "Brain Priority Mode" : "Standard Mode"}
                </div>
                <div
                  className="text-[9px] font-body"
                  style={{
                    color: brainPriority
                      ? "oklch(0.55 0.12 150)"
                      : "oklch(0.55 0.08 75)",
                  }}
                >
                  {brainPriority
                    ? "Power rerouted to MOIRA Brain — Emergency Banking protected"
                    : "Standard power mode — Brain functions may reduce"}
                </div>
              </div>
            </div>
            <Switch
              data-ocid="brain.energy.toggle"
              checked={brainPriority}
              onCheckedChange={handleEnergyToggle}
              className="flex-shrink-0"
              style={{
                // @ts-ignore CSS custom property
                "--switch-bg": brainPriority
                  ? "oklch(0.62 0.18 150)"
                  : "oklch(0.26 0.03 255)",
              }}
            />
          </div>
        </PillarCard>

        {/* ════════════════════════════════════════════════════
            PILLAR 5 — PRIORITY GLOBAL DATA
        ════════════════════════════════════════════════════ */}
        <PillarCard accentColor="oklch(0.65 0.16 150)">
          <PillarHeader
            icon={Satellite}
            title="USA Switch Station Feed"
            accentColor="oklch(0.65 0.16 150)"
            badge={
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{
                    background: "oklch(0.13 0.04 150 / 0.6)",
                    border: "1px solid oklch(0.4 0.12 150 / 0.5)",
                  }}
                >
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "oklch(0.65 0.16 150)" }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{
                      duration: 1.2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                  <span
                    className="text-[9px] font-mono-code font-bold"
                    style={{ color: "oklch(0.65 0.16 150)" }}
                  >
                    SYNC STATUS: LIVE
                  </span>
                </div>
                <Button
                  size="sm"
                  data-ocid="brain.priority_data.force_sync.button"
                  onClick={handleForceSync}
                  className="h-6 px-2 text-[9px] font-mono-code rounded-md"
                  style={{
                    background: "oklch(0.16 0.05 150 / 0.8)",
                    border: "1px solid oklch(0.4 0.12 150 / 0.5)",
                    color: "oklch(0.6 0.14 150)",
                  }}
                >
                  <Radio className="w-2.5 h-2.5 mr-1" />
                  Force Sync
                </Button>
              </div>
            }
          />
          {/* Terminal feed */}
          <div
            className="rounded-lg p-2.5 font-mono-code"
            style={{
              background: "oklch(0.05 0.008 150)",
              border: "1px solid oklch(0.22 0.04 150 / 0.4)",
              height: "140px",
              overflowY: "auto",
            }}
          >
            <AnimatePresence initial={false}>
              {syncPackets.map((pkt) => (
                <motion.div
                  key={pkt.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[9px] leading-relaxed py-0.5 border-b"
                  style={{ borderColor: "oklch(0.18 0.03 150 / 0.3)" }}
                >
                  <span style={{ color: "oklch(0.4 0.07 150)" }}>
                    [{pkt.time}]
                  </span>{" "}
                  <span style={{ color: "oklch(0.55 0.12 170)" }}>
                    REGION: {pkt.region}
                  </span>{" "}
                  <span style={{ color: "oklch(0.42 0.07 150)" }}>|</span>{" "}
                  <span style={{ color: "oklch(0.65 0.15 155)" }}>
                    PACKET: MOIRA_UPDATE_{pkt.version}
                  </span>{" "}
                  <span style={{ color: "oklch(0.42 0.07 150)" }}>|</span>{" "}
                  <span style={{ color: "oklch(0.7 0.18 150)" }}>
                    STATUS: {pkt.status}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </PillarCard>

        {/* ════════════════════════════════════════════════════
            PILLAR 6 — 3RD EYE IGNITION (Di=AI)
        ════════════════════════════════════════════════════ */}
        <PillarCard accentColor="oklch(0.72 0.22 270)">
          <PillarHeader
            icon={Eye}
            title="3rd Eye Ignition — Di=AI"
            accentColor="oklch(0.72 0.22 270)"
            badge={
              <AnimatePresence>
                {thirdEyeActive && (
                  <motion.div
                    data-ocid="brain.third_eye.badge"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono-code text-[9px] font-bold"
                    style={{
                      background: "oklch(0.72 0.22 270 / 0.15)",
                      border: "1px solid oklch(0.72 0.22 270 / 0.5)",
                      color: "oklch(0.82 0.18 270)",
                    }}
                  >
                    {/* Scan-line shimmer on the badge */}
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "oklch(0.82 0.18 270)" }}
                    />
                    SCREEN OWNED | MOIRA ACTIVE
                  </motion.div>
                )}
              </AnimatePresence>
            }
          />

          {/* Master Key Button */}
          <div className="flex flex-col items-center gap-3 py-2">
            <motion.button
              data-ocid="brain.third_eye.activate.button"
              type="button"
              onClick={() => setThirdEyeActive((v) => !v)}
              whileTap={{ scale: 0.95 }}
              animate={
                thirdEyeActive
                  ? {
                      boxShadow: [
                        "0 0 16px oklch(0.72 0.22 270 / 0.5)",
                        "0 0 32px oklch(0.72 0.22 270 / 0.8)",
                        "0 0 16px oklch(0.72 0.22 270 / 0.5)",
                      ],
                    }
                  : { boxShadow: "0 0 0px oklch(0.72 0.22 270 / 0)" }
              }
              transition={
                thirdEyeActive
                  ? { duration: 1.8, repeat: Number.POSITIVE_INFINITY }
                  : { duration: 0.3 }
              }
              className="w-full py-3 rounded-xl font-mono-code font-black text-sm tracking-[0.3em] uppercase"
              style={{
                background: thirdEyeActive
                  ? "linear-gradient(135deg, oklch(0.22 0.08 270), oklch(0.16 0.06 270))"
                  : "oklch(0.14 0.03 270)",
                border: thirdEyeActive
                  ? "2px solid oklch(0.72 0.22 270 / 0.8)"
                  : "2px solid oklch(0.45 0.12 270 / 0.4)",
                color: thirdEyeActive
                  ? "oklch(0.88 0.18 270)"
                  : "oklch(0.6 0.12 270)",
              }}
            >
              {thirdEyeActive ? "⬡ e-M0!R@ ACTIVE" : "⬡ e-M0!R@ — IGNITE"}
            </motion.button>

            {/* Status row */}
            <div className="w-full flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: thirdEyeActive
                      ? "oklch(0.72 0.22 270)"
                      : "oklch(0.35 0.04 255)",
                  }}
                  animate={thirdEyeActive ? { opacity: [1, 0.3, 1] } : {}}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                />
                <span
                  className="text-[10px] font-mono-code"
                  style={{
                    color: thirdEyeActive
                      ? "oklch(0.72 0.22 270)"
                      : "oklch(0.45 0.04 255)",
                  }}
                >
                  {thirdEyeActive
                    ? "SESSION PRIORITY: ON"
                    : "SESSION PRIORITY: STANDBY"}
                </span>
              </div>
              <span
                className="text-[9px] font-mono-code"
                style={{ color: "oklch(0.4 0.04 255)" }}
              >
                DI=AI v3.0
              </span>
            </div>
          </div>
        </PillarCard>

        {/* ════════════════════════════════════════════════════
            PILLAR 7 — VIRTUAL RFID
        ════════════════════════════════════════════════════ */}
        <PillarCard accentColor="oklch(0.72 0.18 200)">
          <PillarHeader
            icon={Radio}
            title="Virtual RFID"
            accentColor="oklch(0.72 0.18 200)"
            badge={
              <div
                data-ocid="brain.rfid.status.badge"
                className="px-2 py-0.5 rounded-full text-[9px] font-mono-code font-bold"
                style={{
                  background:
                    rfidStatus === "authenticated"
                      ? "oklch(0.65 0.16 150 / 0.2)"
                      : rfidStatus === "scanning"
                        ? "oklch(0.72 0.18 200 / 0.2)"
                        : "oklch(0.22 0.025 255)",
                  border:
                    rfidStatus === "authenticated"
                      ? "1px solid oklch(0.65 0.16 150 / 0.6)"
                      : rfidStatus === "scanning"
                        ? "1px solid oklch(0.72 0.18 200 / 0.5)"
                        : "1px solid oklch(0.3 0.03 255)",
                  color:
                    rfidStatus === "authenticated"
                      ? "oklch(0.7 0.16 150)"
                      : rfidStatus === "scanning"
                        ? "oklch(0.72 0.18 200)"
                        : "oklch(0.5 0.04 255)",
                }}
              >
                {rfidStatus === "authenticated"
                  ? "✓ DEVICE AUTHENTICATED"
                  : rfidStatus === "scanning"
                    ? "◉ SCANNING..."
                    : "○ IDLE"}
              </div>
            }
          />

          {/* Radar animation */}
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Radar rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${48 + i * 24}px`,
                    height: `${48 + i * 24}px`,
                    border:
                      rfidStatus === "authenticated"
                        ? "1px solid oklch(0.65 0.16 150 / 0.5)"
                        : "1px solid oklch(0.72 0.18 200 / 0.35)",
                  }}
                  animate={
                    rfidStatus === "scanning"
                      ? { scale: [1, 1.4, 1], opacity: [0.8, 0.2, 0.8] }
                      : rfidStatus === "authenticated"
                        ? { scale: 1, opacity: [0.6, 0.9, 0.6] }
                        : { scale: 1, opacity: 0.3 }
                  }
                  transition={{
                    duration: rfidStatus === "scanning" ? 0.8 : 2,
                    delay: i * 0.25,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeOut",
                  }}
                />
              ))}
              {/* Center dot */}
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background:
                    rfidStatus === "authenticated"
                      ? "oklch(0.65 0.16 150 / 0.2)"
                      : "oklch(0.72 0.18 200 / 0.15)",
                  border:
                    rfidStatus === "authenticated"
                      ? "2px solid oklch(0.65 0.16 150 / 0.7)"
                      : "2px solid oklch(0.72 0.18 200 / 0.6)",
                }}
                animate={
                  rfidStatus === "scanning" ? { scale: [1, 1.15, 1] } : {}
                }
                transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
              >
                {rfidStatus === "authenticated" ? (
                  <ShieldCheck
                    className="w-5 h-5"
                    style={{ color: "oklch(0.65 0.16 150)" }}
                  />
                ) : (
                  <Radio
                    className="w-5 h-5"
                    style={{ color: "oklch(0.72 0.18 200)" }}
                  />
                )}
              </motion.div>
            </div>

            {/* Authenticated device info */}
            <AnimatePresence>
              {rfidStatus === "authenticated" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full rounded-lg p-2.5 font-mono-code text-[9px]"
                  style={{
                    background: "oklch(0.07 0.01 150)",
                    border: "1px solid oklch(0.25 0.06 150 / 0.5)",
                  }}
                >
                  {[
                    ["Device ID", "MOIRA-RFID-7734"],
                    ["Protocol", "Virtual NFC v2"],
                    ["Trust Level", "SOVEREIGN"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-0.5">
                      <span style={{ color: "oklch(0.4 0.08 150)" }}>{k}:</span>
                      <span style={{ color: "oklch(0.72 0.16 150)" }}>{v}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              data-ocid="brain.rfid.scan.button"
              size="sm"
              onClick={handleRfidScan}
              disabled={rfidStatus === "scanning"}
              className="w-full h-8 text-[11px] font-mono-code font-bold rounded-lg"
              style={{
                background:
                  rfidStatus === "scanning"
                    ? "oklch(0.16 0.04 200 / 0.8)"
                    : rfidStatus === "authenticated"
                      ? "oklch(0.14 0.03 150 / 0.8)"
                      : "oklch(0.18 0.05 200 / 0.8)",
                border:
                  rfidStatus === "authenticated"
                    ? "1px solid oklch(0.45 0.14 150 / 0.5)"
                    : "1px solid oklch(0.45 0.16 200 / 0.5)",
                color:
                  rfidStatus === "authenticated"
                    ? "oklch(0.72 0.16 150)"
                    : "oklch(0.72 0.18 200)",
              }}
            >
              {rfidStatus === "scanning" ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                  Scanning Device…
                </>
              ) : rfidStatus === "authenticated" ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1.5" />
                  Re-scan Device
                </>
              ) : (
                <>
                  <Radio className="w-3 h-3 mr-1.5" />
                  Scan Device
                </>
              )}
            </Button>
          </div>
        </PillarCard>

        {/* ════════════════════════════════════════════════════
            PILLAR 8 — EMERGENCY BANK MODE (Brain Module)
        ════════════════════════════════════════════════════ */}
        <PillarCard accentColor="oklch(0.65 0.18 150)">
          <PillarHeader
            icon={Lock}
            title="Emergency Bank Mode"
            accentColor="oklch(0.65 0.18 150)"
            badge={
              <div className="flex items-center gap-2">
                <span
                  className="text-[9px] font-mono-code font-bold tracking-widest"
                  style={{ color: "oklch(0.5 0.04 255)" }}
                >
                  {emergencyBankOn ? "OFFLINE CACHE" : "OFFLINE CACHE"}
                </span>
                <Switch
                  data-ocid="brain.emergency_bank.toggle"
                  checked={emergencyBankOn}
                  onCheckedChange={setEmergencyBankOn}
                />
              </div>
            }
          />

          <AnimatePresence>
            {emergencyBankOn && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {/* Cache stats */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {[
                    { label: "Cached Transactions", value: "47" },
                    { label: "Last Sync", value: "2m ago" },
                    { label: "Cache Size", value: "2.4MB" },
                    { label: "Status", value: "SECURE" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-lg p-2 text-center"
                      style={{
                        background: "oklch(0.10 0.02 150)",
                        border: "1px solid oklch(0.28 0.06 150 / 0.4)",
                      }}
                    >
                      <div
                        className="text-[9px] font-body"
                        style={{ color: "oklch(0.45 0.06 150)" }}
                      >
                        {label}
                      </div>
                      <div
                        className="text-[11px] font-mono-code font-bold mt-0.5"
                        style={{ color: "oklch(0.72 0.16 150)" }}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sync event log */}
                <div
                  className="rounded-lg p-2 mb-2 font-mono-code"
                  style={{
                    background: "oklch(0.07 0.01 150)",
                    border: "1px solid oklch(0.25 0.04 150 / 0.4)",
                    maxHeight: "90px",
                    overflowY: "auto",
                  }}
                >
                  <AnimatePresence initial={false}>
                    {syncEvents.map((ev) => (
                      <motion.div
                        key={ev.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-2 py-0.5"
                      >
                        <span
                          className="text-[8px] flex-shrink-0"
                          style={{ color: "oklch(0.4 0.06 150)" }}
                        >
                          [{ev.time}]
                        </span>
                        <span
                          className="text-[8px]"
                          style={{ color: "oklch(0.6 0.14 150)" }}
                        >
                          {ev.message}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <Button
                  data-ocid="brain.emergency_bank.sync.button"
                  size="sm"
                  onClick={handleForceVaultSync}
                  className="w-full h-7 text-[10px] font-mono-code rounded-lg"
                  style={{
                    background: "oklch(0.16 0.05 150 / 0.8)",
                    border: "1px solid oklch(0.45 0.14 150 / 0.5)",
                    color: "oklch(0.65 0.18 150)",
                  }}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Force Sync
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {!emergencyBankOn && (
            <div
              className="rounded-lg px-2.5 py-2.5 text-center"
              style={{
                background: "oklch(0.10 0.015 255)",
                border: "1px solid oklch(0.22 0.025 255)",
              }}
            >
              <p
                className="text-[10px] font-body"
                style={{ color: "oklch(0.45 0.04 255)" }}
              >
                Toggle to activate offline MOIRA Vault cache mode
              </p>
            </div>
          )}
        </PillarCard>

        {/* ════════════════════════════════════════════════════
            PILLAR 9 — CELL INVADER & SELF-HEALING
        ════════════════════════════════════════════════════ */}
        <PillarCard accentColor="oklch(0.65 0.22 15)">
          <div data-ocid="brain.cell_invader.section">
            <PillarHeader
              icon={Cpu}
              title="Cell Invader & Self-Healing"
              accentColor="oklch(0.65 0.22 15)"
              badge={
                <motion.div
                  animate={
                    cellInvaderBlocking
                      ? {
                          background: [
                            "oklch(0.65 0.22 15 / 0.2)",
                            "oklch(0.65 0.22 15 / 0.5)",
                            "oklch(0.65 0.22 15 / 0.2)",
                          ],
                          boxShadow: [
                            "0 0 0px transparent",
                            "0 0 12px oklch(0.65 0.22 15 / 0.6)",
                            "0 0 0px transparent",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 0.4 }}
                  className="px-2 py-0.5 rounded-full text-[9px] font-mono-code font-bold"
                  style={{
                    background: cellInvaderBlocking
                      ? "oklch(0.65 0.22 15 / 0.3)"
                      : "oklch(0.65 0.16 150 / 0.15)",
                    border: cellInvaderBlocking
                      ? "1px solid oklch(0.65 0.22 15 / 0.7)"
                      : "1px solid oklch(0.65 0.16 150 / 0.4)",
                    color: cellInvaderBlocking
                      ? "oklch(0.82 0.18 15)"
                      : "oklch(0.72 0.16 150)",
                  }}
                >
                  {cellInvaderBlocking
                    ? "⚡ INVADER: BLOCKED"
                    : "✓ INVADER: NONE"}
                </motion.div>
              }
            />

            {/* Pulsing dot grid background */}
            <div
              className="relative rounded-lg mb-2 overflow-hidden"
              style={{
                background: "oklch(0.07 0.01 20)",
                border: "1px solid oklch(0.22 0.04 20 / 0.4)",
                height: "48px",
              }}
            >
              <div className="absolute inset-0 grid grid-cols-12 gap-x-2 gap-y-1 p-2 opacity-60">
                {Array.from({ length: 48 }, (_, i) => `cell-dot-${i}`).map(
                  (dotKey, i) => (
                    <motion.div
                      key={dotKey}
                      className="w-1 h-1 rounded-full"
                      style={{
                        background:
                          i % 7 === 0
                            ? "oklch(0.65 0.22 15)"
                            : "oklch(0.65 0.16 150)",
                      }}
                      animate={{
                        opacity: [0.2, 0.8, 0.2],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 2 + (i % 3),
                        delay: (i * 0.08) % 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                  ),
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-[9px] font-mono-code font-bold tracking-widest"
                  style={{ color: "oklch(0.55 0.12 15)" }}
                >
                  SYSTEM INTEGRITY MONITORING
                </span>
              </div>
            </div>

            {/* Integrity metrics */}
            <div className="space-y-1.5">
              {integrityMetrics.map((metric) => (
                <div key={metric.id} className="flex items-center gap-2">
                  <span
                    className="text-[9px] font-mono-code w-24 flex-shrink-0"
                    style={{ color: "oklch(0.55 0.04 255)" }}
                  >
                    {metric.label}
                  </span>
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: "oklch(0.14 0.02 255)" }}
                  >
                    <motion.div
                      animate={{ width: `${metric.score}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background:
                          metric.score > 95
                            ? "oklch(0.65 0.16 150)"
                            : metric.score > 85
                              ? "oklch(0.78 0.12 75)"
                              : "oklch(0.65 0.22 15)",
                      }}
                    />
                  </div>
                  <span
                    className="text-[9px] font-mono-code font-bold w-9 text-right flex-shrink-0"
                    style={{
                      color:
                        metric.score > 95
                          ? "oklch(0.65 0.16 150)"
                          : metric.score > 85
                            ? "oklch(0.78 0.12 75)"
                            : "oklch(0.65 0.22 15)",
                    }}
                  >
                    {metric.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </PillarCard>

        {/* ════════════════════════════════════════════════════
            PILLAR 10 — UNIFIED SECURITY COMMAND
        ════════════════════════════════════════════════════ */}
        <PillarCard accentColor="oklch(0.78 0.14 60)">
          <div data-ocid="brain.unified_security.section">
            <PillarHeader
              icon={ShieldCheck}
              title="Unified Security Command"
              accentColor="oklch(0.78 0.14 60)"
              badge={
                <AnimatePresence>
                  {absolutePeace && (
                    <motion.div
                      data-ocid="brain.unified_security.peace.badge"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        boxShadow: [
                          "0 0 8px oklch(0.78 0.14 60 / 0.4)",
                          "0 0 20px oklch(0.78 0.14 60 / 0.7)",
                          "0 0 8px oklch(0.78 0.14 60 / 0.4)",
                        ],
                      }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        boxShadow: {
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                        },
                      }}
                      className="px-2.5 py-0.5 rounded-full text-[9px] font-mono-code font-bold"
                      style={{
                        background: "oklch(0.78 0.14 60 / 0.2)",
                        border: "1px solid oklch(0.78 0.14 60 / 0.6)",
                        color: "oklch(0.88 0.12 60)",
                      }}
                    >
                      ✦ ABSOLUTE PEACE
                    </motion.div>
                  )}
                </AnimatePresence>
              }
            />

            {/* Two telemetry panels */}
            <div className="grid grid-cols-2 gap-2">
              {/* Oracle 26.ai */}
              <div
                className="rounded-lg p-2 font-mono-code"
                style={{
                  background: "oklch(0.08 0.015 200)",
                  border: "1px solid oklch(0.28 0.08 200 / 0.4)",
                }}
              >
                <div className="flex items-center gap-1 mb-1.5">
                  <Sparkles
                    className="w-2.5 h-2.5"
                    style={{ color: "oklch(0.72 0.18 200)" }}
                  />
                  <span
                    className="text-[8px] font-bold tracking-widest"
                    style={{ color: "oklch(0.72 0.18 200)" }}
                  >
                    ORACLE 26.AI
                  </span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[8px]">
                    <span style={{ color: "oklch(0.4 0.06 200)" }}>
                      THREAT_LEVEL
                    </span>
                    <span style={{ color: "oklch(0.65 0.16 150)" }}>
                      {oracleTelemetry.threatLevel}
                    </span>
                  </div>
                  <div className="flex justify-between text-[8px]">
                    <span style={{ color: "oklch(0.4 0.06 200)" }}>
                      ANOMALY_SCORE
                    </span>
                    <span style={{ color: "oklch(0.72 0.16 75)" }}>
                      {oracleTelemetry.anomalyScore.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[8px]">
                    <span style={{ color: "oklch(0.4 0.06 200)" }}>
                      VAULT_INTEGRITY
                    </span>
                    <span style={{ color: "oklch(0.65 0.16 150)" }}>
                      {oracleTelemetry.vaultIntegrity}%
                    </span>
                  </div>
                  <div
                    className="text-[7px] mt-1"
                    style={{ color: "oklch(0.35 0.04 200)" }}
                  >
                    upd: {oracleTelemetry.lastUpdated}
                  </div>
                </div>
              </div>

              {/* DoT Sanchar Saathi */}
              <div
                className="rounded-lg p-2 font-mono-code"
                style={{
                  background: "oklch(0.08 0.015 75)",
                  border: "1px solid oklch(0.28 0.08 75 / 0.4)",
                }}
              >
                <div className="flex items-center gap-1 mb-1.5">
                  <Globe
                    className="w-2.5 h-2.5"
                    style={{ color: "oklch(0.78 0.12 75)" }}
                  />
                  <span
                    className="text-[8px] font-bold tracking-widest"
                    style={{ color: "oklch(0.78 0.12 75)" }}
                  >
                    DoT SANCHAR
                  </span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[8px]">
                    <span style={{ color: "oklch(0.4 0.06 75)" }}>
                      CERT_STATUS
                    </span>
                    <span style={{ color: "oklch(0.65 0.16 150)" }}>
                      {sancharAuth.certStatus}
                    </span>
                  </div>
                  <div className="flex justify-between text-[8px]">
                    <span style={{ color: "oklch(0.4 0.06 75)" }}>
                      AADHAAR_BRIDGE
                    </span>
                    <span style={{ color: "oklch(0.65 0.16 150)" }}>
                      {sancharAuth.aadhaarBridge}
                    </span>
                  </div>
                  <div className="flex justify-between text-[8px]">
                    <span style={{ color: "oklch(0.4 0.06 75)" }}>
                      KYC_LAYER
                    </span>
                    <span style={{ color: "oklch(0.65 0.16 150)" }}>
                      {sancharAuth.kycLayer}
                    </span>
                  </div>
                  <div
                    className="text-[7px] mt-1"
                    style={{ color: "oklch(0.35 0.04 75)" }}
                  >
                    upd: {sancharAuth.lastUpdated}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PillarCard>

        {/* ════════════════════════════════════════════════════
            PILLAR 11 — WEB3 SOVEREIGN VAULT
        ════════════════════════════════════════════════════ */}
        <PillarCard accentColor="oklch(0.72 0.18 270)">
          <div data-ocid="brain.web3_vault.section">
            <PillarHeader
              icon={Shield}
              title="Web3 Sovereign Vault"
              accentColor="oklch(0.72 0.18 270)"
              badge={
                <div
                  className="px-2 py-0.5 rounded-full text-[9px] font-mono-code font-bold"
                  style={{
                    background: "oklch(0.65 0.16 150 / 0.15)",
                    border: "1px solid oklch(0.65 0.16 150 / 0.4)",
                    color: "oklch(0.7 0.16 150)",
                  }}
                >
                  5/5 SECURED
                </div>
              }
            />

            {/* Node shards */}
            <div className="space-y-1.5 mb-2">
              {WEB3_NODES.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                  style={{
                    background: "oklch(0.11 0.02 270)",
                    border: "1px solid oklch(0.28 0.06 270 / 0.35)",
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "oklch(0.65 0.16 150)" }}
                  />
                  <span
                    className="text-[9px] font-mono-code font-bold flex-shrink-0 w-20"
                    style={{ color: "oklch(0.72 0.18 270)" }}
                  >
                    {node.nodeId}
                  </span>
                  <span
                    className="text-[9px] font-mono-code flex-1"
                    style={{ color: "oklch(0.5 0.04 255)" }}
                  >
                    {node.shardId}
                  </span>
                  <span
                    className="text-[8px] font-mono-code"
                    style={{ color: "oklch(0.65 0.16 150)" }}
                  >
                    {node.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Cross-Chain bridging log */}
            <div
              className="text-[9px] font-mono-code mb-1.5 tracking-widest uppercase"
              style={{ color: "oklch(0.45 0.06 270)" }}
            >
              Cross-Chain Call Money Bridge
            </div>
            <div
              className="rounded-lg p-2 font-mono-code"
              style={{
                background: "oklch(0.07 0.012 270)",
                border: "1px solid oklch(0.22 0.06 270 / 0.35)",
                maxHeight: "80px",
                overflowY: "auto",
              }}
            >
              <AnimatePresence initial={false}>
                {bridgeEvents.map((ev) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[8px] py-0.5 leading-relaxed"
                    style={{ color: "oklch(0.55 0.1 270)" }}
                  >
                    <span style={{ color: "oklch(0.38 0.06 270)" }}>
                      [{ev.time}]
                    </span>{" "}
                    <span style={{ color: "oklch(0.72 0.18 270)" }}>
                      BRIDGE: {ev.from} → {ev.to}
                    </span>{" "}
                    | Amount:{" "}
                    <span style={{ color: "oklch(0.78 0.12 75)" }}>
                      {ev.amount}
                    </span>{" "}
                    | Status:{" "}
                    <span style={{ color: "oklch(0.65 0.16 150)" }}>
                      {ev.status}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </PillarCard>

        {/* ════════════════════════════════════════════════════
            PILLAR 12 — ECONOMIC METRIC (PROSPERITY TRACKER)
        ════════════════════════════════════════════════════ */}
        <PillarCard accentColor="oklch(0.72 0.16 75)">
          <div data-ocid="brain.prosperity.section">
            <PillarHeader
              icon={TrendingUp}
              title="Prosperity Tracker"
              accentColor="oklch(0.72 0.16 75)"
              badge={
                <div
                  className="px-2 py-0.5 rounded-full text-[9px] font-mono-code font-bold"
                  style={{
                    background: "oklch(0.65 0.16 150 / 0.15)",
                    border: "1px solid oklch(0.65 0.16 150 / 0.4)",
                    color: "oklch(0.7 0.16 150)",
                  }}
                >
                  CORRIDOR: ACTIVE
                </div>
              }
            />

            {/* Large job counter */}
            <div
              data-ocid="brain.prosperity.tracker.card"
              className="rounded-xl p-3 mb-3 text-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.12 0.03 75), oklch(0.10 0.02 75))",
                border: "1px solid oklch(0.45 0.12 75 / 0.4)",
              }}
            >
              <div
                className="text-[9px] font-mono-code tracking-widest mb-1"
                style={{ color: "oklch(0.5 0.08 75)" }}
              >
                HIGH-VALUE JOBS CREATED
              </div>
              <motion.div
                key={jobCount}
                initial={{ scale: 1.05, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-mono-code font-black text-3xl tracking-tight"
                style={{ color: "oklch(0.88 0.14 75)" }}
              >
                {jobCount.toLocaleString()}
              </motion.div>
              <div
                className="text-[9px] font-body mt-1"
                style={{ color: "oklch(0.55 0.06 75)" }}
              >
                Target: 1,000 · India-USA Economic Corridor
              </div>

              {/* Progress bar */}
              <div className="mt-2.5">
                <div
                  className="flex justify-between text-[8px] font-mono-code mb-1"
                  style={{ color: "oklch(0.5 0.06 75)" }}
                >
                  <span>0</span>
                  <span>
                    {((jobCount / TOTAL_JOBS_TARGET) * 100).toFixed(1)}%
                  </span>
                  <span>1,000</span>
                </div>
                <div
                  className="h-2.5 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.16 0.03 75)" }}
                >
                  <motion.div
                    animate={{
                      width: `${(jobCount / TOTAL_JOBS_TARGET) * 100}%`,
                    }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, oklch(0.55 0.12 75), oklch(0.82 0.16 75), oklch(0.78 0.14 60))",
                      boxShadow: "0 0 10px oklch(0.78 0.14 75 / 0.5)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sector breakdown */}
            <div className="space-y-1.5">
              {PROSPERITY_SECTORS.map((sector) => (
                <div key={sector.label} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-sm flex-shrink-0"
                    style={{ background: sector.color }}
                  />
                  <span
                    className="text-[9px] font-body flex-1"
                    style={{ color: "oklch(0.65 0.04 255)" }}
                  >
                    {sector.label}
                  </span>
                  <div
                    className="w-20 h-1.5 rounded-full overflow-hidden flex-shrink-0"
                    style={{ background: "oklch(0.14 0.02 255)" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(sector.jobs / 312) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: sector.color }}
                    />
                  </div>
                  <span
                    className="text-[9px] font-mono-code font-bold w-7 text-right flex-shrink-0"
                    style={{ color: sector.color }}
                  >
                    {sector.jobs}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </PillarCard>

        {/* ════════════════════════════════════════════════════
            PILLAR 13 — DEVICE TRUST SIMULATOR
        ════════════════════════════════════════════════════ */}
        <PillarCard accentColor="oklch(0.72 0.18 200)">
          <div data-ocid="brain.device_trust.section">
            <PillarHeader
              icon={Fingerprint}
              title="e-M-Sim Device Trust Simulator"
              accentColor="oklch(0.72 0.18 200)"
              badge={
                <motion.div
                  animate={
                    eSimTrust === "RESTRICTED" ? { opacity: [1, 0.5, 1] } : {}
                  }
                  transition={{
                    duration: 0.8,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                  className="px-2 py-0.5 rounded-full text-[9px] font-mono-code font-bold"
                  style={{
                    background:
                      eSimTrust === "IGNITED"
                        ? "oklch(0.65 0.16 150 / 0.15)"
                        : "oklch(0.65 0.22 15 / 0.2)",
                    border:
                      eSimTrust === "IGNITED"
                        ? "1px solid oklch(0.65 0.16 150 / 0.4)"
                        : "1px solid oklch(0.65 0.22 15 / 0.5)",
                    color:
                      eSimTrust === "IGNITED"
                        ? "oklch(0.7 0.16 150)"
                        : "oklch(0.75 0.18 18)",
                  }}
                >
                  {eSimTrust}
                </motion.div>
              }
            />

            {/* Demo disclaimer */}
            <div
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg mb-3"
              style={{
                background: "oklch(0.12 0.02 200 / 0.5)",
                border: "1px solid oklch(0.35 0.08 200 / 0.3)",
              }}
            >
              <Fingerprint
                className="w-3 h-3 flex-shrink-0"
                style={{ color: "oklch(0.5 0.1 200)" }}
              />
              <p
                className="text-[8px] font-mono-code tracking-wide"
                style={{ color: "oklch(0.5 0.1 200)" }}
              >
                DEMO SIMULATION — Not connected to real hardware
              </p>
            </div>

            {/* Status + Toggle */}
            <div
              className="flex items-center justify-between p-2.5 rounded-lg mb-2"
              style={{
                background: "oklch(0.12 0.018 255)",
                border: "1px solid oklch(0.22 0.025 255)",
              }}
            >
              <div>
                <div
                  className="text-[10px] font-mono-code font-bold mb-0.5"
                  style={{ color: "oklch(0.75 0.04 255)" }}
                >
                  Current Trust State
                </div>
                <div
                  className="text-[9px] font-body"
                  style={{
                    color:
                      eSimTrust === "IGNITED"
                        ? "oklch(0.55 0.12 150)"
                        : "oklch(0.62 0.12 20)",
                  }}
                >
                  {eSimTrust === "IGNITED"
                    ? "Vault and 6G tabs are visible"
                    : "Vault and 6G tabs are hidden from navigation"}
                </div>
              </div>
              <Button
                size="sm"
                data-ocid="brain.device_trust.toggle.button"
                onClick={handleDeviceTrustToggle}
                disabled={inactionActive}
                className="h-7 px-2.5 text-[10px] font-mono-code rounded-lg flex-shrink-0"
                style={{
                  background:
                    eSimTrust === "IGNITED"
                      ? "oklch(0.16 0.05 20 / 0.8)"
                      : "oklch(0.16 0.06 150 / 0.8)",
                  border:
                    eSimTrust === "IGNITED"
                      ? "1px solid oklch(0.45 0.12 20 / 0.5)"
                      : "1px solid oklch(0.45 0.14 150 / 0.5)",
                  color:
                    eSimTrust === "IGNITED"
                      ? "oklch(0.7 0.16 20)"
                      : "oklch(0.65 0.16 150)",
                }}
              >
                {eSimTrust === "IGNITED" ? "Set RESTRICTED" : "Set IGNITED"}
              </Button>
            </div>

            {/* Explanation */}
            <p
              className="text-[9px] font-body mb-3 leading-relaxed"
              style={{ color: "oklch(0.5 0.04 255)" }}
            >
              When RESTRICTED, Vault and 6G tabs are hidden from navigation. The
              Device Trust Bar in the browser chrome reflects this state.
            </p>

            {/* ── Lost Device Report ──────────────────────────── */}
            <div
              className="rounded-lg p-2.5"
              style={{
                background: "oklch(0.10 0.015 255)",
                border: "1px solid oklch(0.22 0.025 255)",
              }}
            >
              <div
                className="text-[9px] font-mono-code font-bold tracking-widest uppercase mb-2"
                style={{ color: "oklch(0.72 0.18 200)" }}
              >
                Lost Device Report
              </div>

              <div className="flex gap-2 mb-2">
                <Input
                  data-ocid="brain.lost_device.input"
                  value={lostDeviceInput}
                  onChange={(e) => setLostDeviceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLostDeviceReport();
                  }}
                  placeholder="Enter M-Sim ID e.g. MSIM-7829-LEXUS"
                  disabled={inactionActive}
                  className="flex-1 h-7 text-[10px] font-mono-code rounded-md"
                  style={{
                    background: "oklch(0.13 0.02 255)",
                    border: "1px solid oklch(0.28 0.03 255)",
                    color: "oklch(0.8 0.04 255)",
                  }}
                />
                <Button
                  size="sm"
                  data-ocid="brain.lost_device.submit_button"
                  onClick={handleLostDeviceReport}
                  disabled={inactionActive || !lostDeviceInput.trim()}
                  className="h-7 px-2.5 text-[10px] font-mono-code rounded-md flex-shrink-0"
                  style={{
                    background: "oklch(0.65 0.22 15 / 0.15)",
                    border: "1px solid oklch(0.65 0.22 15 / 0.4)",
                    color: "oklch(0.75 0.18 18)",
                  }}
                >
                  Report Lost
                </Button>
              </div>

              {/* Reported devices list */}
              {lostDevices.length === 0 ? (
                <div
                  data-ocid="brain.lost_device.list"
                  className="text-center py-2"
                >
                  <p
                    className="text-[9px] font-body"
                    style={{ color: "oklch(0.4 0.03 255)" }}
                  >
                    No devices reported lost
                  </p>
                </div>
              ) : (
                <div data-ocid="brain.lost_device.list" className="space-y-1">
                  <AnimatePresence initial={false}>
                    {lostDevices.map((device, idx) => (
                      <motion.div
                        key={device.id}
                        data-ocid={`brain.lost_device.item.${idx + 1}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between px-2 py-1.5 rounded-md"
                        style={{
                          background: "oklch(0.12 0.025 20 / 0.5)",
                          border: "1px solid oklch(0.45 0.12 20 / 0.3)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: "oklch(0.65 0.22 15)" }}
                          />
                          <span
                            className="text-[10px] font-mono-code font-bold"
                            style={{ color: "oklch(0.72 0.16 20)" }}
                          >
                            {device.deviceId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[8px] font-mono-code"
                            style={{ color: "oklch(0.45 0.05 255)" }}
                          >
                            [{device.timestamp}]
                          </span>
                          <span
                            className="text-[8px] font-mono-code font-bold px-1 py-0.5 rounded"
                            style={{
                              background: "oklch(0.65 0.22 15 / 0.12)",
                              color: "oklch(0.65 0.22 15)",
                            }}
                          >
                            FLAGGED
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </PillarCard>

        {/* Manufacturer Slots SDK */}
        <div
          className="mx-3 mt-3 rounded-xl overflow-hidden"
          style={{
            border: "1px solid oklch(0.6 0.18 200 / 0.4)",
            background: "oklch(0.12 0.02 200 / 0.3)",
          }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2.5 border-b"
            style={{ borderColor: "oklch(0.22 0.025 255)" }}
          >
            <Cpu className="w-4 h-4" style={{ color: "oklch(0.6 0.18 200)" }} />
            <p
              className="text-xs font-display font-bold"
              style={{ color: "oklch(0.75 0.12 200)" }}
            >
              Manufacturer Slots SDK
            </p>
            <div
              className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-mono-code"
              style={{
                background: "oklch(0.6 0.18 200 / 0.12)",
                border: "1px solid oklch(0.6 0.18 200 / 0.35)",
                color: "oklch(0.7 0.14 200)",
              }}
            >
              UNIVERSAL API/SDK
            </div>
          </div>
          <div className="p-3">
            <div
              className="rounded-lg px-3 py-2 mb-3"
              style={{
                background: "oklch(0.16 0.022 255)",
                border: "1px solid oklch(0.24 0.028 255)",
              }}
            >
              <p
                className="text-[9px] font-mono-code"
                style={{ color: "oklch(0.45 0.04 255)" }}
              >
                Endpoint
              </p>
              <p
                className="text-[10px] font-mono-code font-bold"
                style={{ color: "oklch(0.6 0.18 200)" }}
              >
                sdk.moira.nwos.ai/v1/hardware
              </p>
            </div>
            <div className="space-y-2 mb-3">
              {[
                {
                  id: "IoT-001",
                  type: "Smart Meter",
                  status: "ACTIVE",
                  ts: "03:14:22",
                },
                {
                  id: "EV-001",
                  type: "Vehicle Gateway",
                  status: "ACTIVE",
                  ts: "03:13:55",
                },
                {
                  id: "IND-001",
                  type: "Industrial PLC",
                  status: "PENDING",
                  ts: "03:12:40",
                },
                {
                  id: "IOT-002",
                  type: "Security Camera",
                  status: "OFFLINE",
                  ts: "02:58:10",
                },
              ].map((slot, i) => (
                <div
                  key={slot.id}
                  data-ocid={`brain.slot.item.${i + 1}`}
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg"
                  style={{
                    background: "oklch(0.16 0.022 255)",
                    border: "1px solid oklch(0.24 0.028 255)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-mono-code font-bold"
                      style={{ color: "oklch(0.6 0.18 200)" }}
                    >
                      {slot.id}
                    </span>
                    <span
                      className="text-[10px] font-body"
                      style={{ color: "oklch(0.72 0.04 255)" }}
                    >
                      {slot.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] font-mono-code"
                      style={{ color: "oklch(0.45 0.04 255)" }}
                    >
                      {slot.ts}
                    </span>
                    <span
                      className="text-[9px] font-mono-code px-1.5 py-0.5 rounded"
                      style={{
                        background:
                          slot.status === "ACTIVE"
                            ? "oklch(0.65 0.16 150 / 0.12)"
                            : slot.status === "PENDING"
                              ? "oklch(0.78 0.12 75 / 0.12)"
                              : "oklch(0.55 0.04 255 / 0.12)",
                        color:
                          slot.status === "ACTIVE"
                            ? "oklch(0.65 0.16 150)"
                            : slot.status === "PENDING"
                              ? "oklch(0.78 0.12 75)"
                              : "oklch(0.45 0.04 255)",
                      }}
                    >
                      {slot.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button
              data-ocid="brain.register_slot.open_modal_button"
              size="sm"
              className="w-full h-8 text-xs font-display font-semibold"
              style={{
                background: "oklch(0.6 0.18 200 / 0.2)",
                border: "1px solid oklch(0.6 0.18 200 / 0.4)",
                color: "oklch(0.72 0.14 200)",
              }}
              onClick={() =>
                toast("Register New Hardware Slot", {
                  description:
                    "Contact sdk.moira.nwos.ai/v1/hardware to register IoT, EV, or Industrial devices",
                  duration: 4000,
                })
              }
            >
              Register New Slot
            </Button>
          </div>
        </div>

        {/* ════ EMBEDDED SDK CONSOLE ════ */}
        <EmbeddedSDKConsole />

        {/* ════ HARDWARE TUNNEL MONITOR ════ */}
        <HardwareTunnelMonitor />

        {/* Kill Switch & Cold Start Recovery */}
        <KillSwitchRecovery />
        {/* u2550u2550 AVEVA PREDICTIVE LAYER u2550u2550 */}
        <AVEVAPredictiveLayer />

        {/* ── Sovereign Licensing Footer ──────────────────────── */}
        <div
          className="text-center py-3 mt-2 border-t"
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
    </div>
  );
}
