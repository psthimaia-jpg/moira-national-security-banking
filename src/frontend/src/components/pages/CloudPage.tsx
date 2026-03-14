import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Box,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cloud,
  CloudUpload,
  Cpu,
  Database,
  Globe,
  HardDrive,
  MemoryStick,
  Network,
  OctagonX,
  Play,
  Server,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ── Design constants ──────────────────────────────────────
const CYAN = "oklch(0.72 0.15 200)";
const CYAN_BG = "oklch(0.72 0.15 200 / 0.1)";
const CYAN_BORDER = "oklch(0.72 0.15 200 / 0.3)";
const CARD_BG = "oklch(0.16 0.022 255)";
const CARD_BORDER = "oklch(0.26 0.03 255)";
const SURFACE_BG = "oklch(0.14 0.02 255)";
const GREEN = "oklch(0.65 0.16 150)";
const RED = "oklch(0.65 0.22 15)";
const YELLOW = "oklch(0.78 0.12 75)";

// ── Data ──────────────────────────────────────────────────
const INSTANCES = [
  {
    name: "moira-node-01",
    region: "US-East",
    cpu: 34,
    mem: 52,
    status: "running" as const,
  },
  {
    name: "moira-node-02",
    region: "EU-West",
    cpu: 71,
    mem: 68,
    status: "running" as const,
  },
  {
    name: "moira-node-03",
    region: "Asia-Pacific",
    cpu: 12,
    mem: 30,
    status: "stopped" as const,
  },
  {
    name: "moira-vault-01",
    region: "US-East",
    cpu: 88,
    mem: 91,
    status: "running" as const,
  },
];

const COSTS = [
  { label: "Compute", amount: 124.5, color: CYAN, icon: Cpu },
  { label: "Storage", amount: 38.2, color: GREEN, icon: HardDrive },
  { label: "Network", amount: 22.8, color: YELLOW, icon: Network },
  {
    label: "Database",
    amount: 67.0,
    color: "oklch(0.7 0.15 300)",
    icon: Database,
  },
];
const TOTAL_COST = COSTS.reduce((sum, c) => sum + c.amount, 0);

const BUCKETS = [
  {
    name: "moira-backups",
    used: 1.2,
    total: 2.0,
    icon: "💾",
  },
  {
    name: "moira-assets",
    used: 0.8,
    total: 1.5,
    icon: "🖼️",
  },
  {
    name: "moira-logs",
    used: 0.4,
    total: 0.5,
    icon: "📜",
  },
];

// ── Sub-components ────────────────────────────────────────
function StatusDot({ status }: { status: "running" | "stopped" | "paused" }) {
  const color =
    status === "running" ? GREEN : status === "stopped" ? RED : YELLOW;
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle"
      style={{ background: color, boxShadow: `0 0 4px ${color}` }}
    />
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
      className="rounded-full overflow-hidden"
      style={{
        background: "oklch(0.24 0.032 255)",
        height,
        width: "100%",
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ background: color, height: "100%", borderRadius: 9999 }}
      />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function CloudPage({
  inactionActive = false,
}: { inactionActive?: boolean }) {
  const [region, setRegion] = useState("us-east");

  const handleAction = (action: string) => {
    if (inactionActive) return;
    const messages: Record<string, string> = {
      launch: "Launching new compute instance…",
      snapshot: "Snapshot initiated — ETA 45 seconds",
      scaleUp: "Scaling up — adding 2 vCPUs",
      scaleDown: "Scaling down — freeing resources",
    };
    toast.success(messages[action] ?? action, {
      icon: <Zap className="w-3.5 h-3.5" style={{ color: CYAN }} />,
    });
  };

  return (
    <div className="pb-3">
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
          Inaction Safety engaged — cloud actions locked
        </div>
      )}
      {/* ── Header ─────────────────────────────── */}
      <div
        className="mx-3 mt-3 rounded-2xl p-3 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.04 210) 0%, oklch(0.12 0.025 230) 60%, oklch(0.15 0.035 195) 100%)",
          border: `1px solid ${CYAN_BORDER}`,
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${CYAN}, transparent 70%)`,
          }}
        />
        <div
          className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.16 150), transparent 70%)",
          }}
        />

        <div className="relative z-10 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: CYAN_BG,
                border: `1px solid ${CYAN_BORDER}`,
              }}
            >
              <Cloud className="w-4 h-4" style={{ color: CYAN }} />
            </div>
            <div>
              <p
                className="font-display font-bold text-sm text-foreground leading-tight"
                data-ocid="cloud.section"
              >
                Cloud Computing
              </p>
              <p className="text-[10px] text-muted-foreground font-body">
                Moira Infrastructure
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
              All Systems Operational
            </Badge>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger
                className="h-6 text-[10px] font-mono-code w-[100px] px-2 border-0"
                style={{
                  background: "oklch(0.18 0.028 255)",
                  border: "1px solid oklch(0.3 0.035 255)",
                  color: "oklch(0.8 0.03 255)",
                }}
                data-ocid="cloud.region.select"
              >
                <Globe
                  className="w-2.5 h-2.5 mr-1 flex-shrink-0"
                  style={{ color: CYAN }}
                />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us-east">US-East</SelectItem>
                <SelectItem value="eu-west">EU-West</SelectItem>
                <SelectItem value="asia-pacific">Asia-Pacific</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Resource Overview ───────────────────── */}
      <div className="mx-3 mt-3">
        <p className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Resources
        </p>
        <div className="grid grid-cols-3 gap-2">
          {/* Compute Instances */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl p-2.5 flex flex-col gap-1.5"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            data-ocid="cloud.compute.card"
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: CYAN_BG }}
            >
              <Server className="w-3 h-3" style={{ color: CYAN }} />
            </div>
            <p className="font-display font-bold text-sm text-foreground leading-tight">
              4
              <span className="text-[10px] font-body font-normal text-muted-foreground ml-0.5">
                /6
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground font-body leading-tight">
              Compute running
            </p>
          </motion.div>

          {/* Storage */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl p-2.5 flex flex-col gap-1.5"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            data-ocid="cloud.storage.card"
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.65 0.16 150 / 0.1)" }}
            >
              <HardDrive className="w-3 h-3" style={{ color: GREEN }} />
            </div>
            <p className="font-display font-bold text-sm text-foreground leading-tight">
              2.4
              <span className="text-[10px] font-body font-normal text-muted-foreground ml-0.5">
                TB
              </span>
            </p>
            <MiniBar value={(2.4 / 5) * 100} color={GREEN} />
            <p className="text-[10px] text-muted-foreground font-body leading-tight">
              of 5 TB used
            </p>
          </motion.div>

          {/* Bandwidth */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl p-2.5 flex flex-col gap-1.5"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            data-ocid="cloud.bandwidth.card"
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.78 0.12 75 / 0.1)" }}
            >
              <Network className="w-3 h-3" style={{ color: YELLOW }} />
            </div>
            <p className="font-display font-bold text-sm text-foreground leading-tight">
              847
              <span className="text-[10px] font-body font-normal text-muted-foreground ml-0.5">
                Mbps
              </span>
            </p>
            <MiniBar value={(847 / 1000) * 100} color={YELLOW} />
            <p className="text-[10px] text-muted-foreground font-body leading-tight">
              of 1 Gbps
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Quick Actions ───────────────────────── */}
      <div className="mx-3 mt-3">
        <p className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Quick Actions
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { key: "launch", label: "Launch", icon: Play, color: CYAN },
            { key: "snapshot", label: "Snapshot", icon: Camera, color: GREEN },
            {
              key: "scaleUp",
              label: "Scale ↑",
              icon: ChevronUp,
              color: YELLOW,
            },
            {
              key: "scaleDown",
              label: "Scale ↓",
              icon: ChevronDown,
              color: "oklch(0.65 0.22 15)",
            },
          ].map(({ key, label, icon: Icon, color }, idx) => (
            <motion.button
              key={key}
              type="button"
              whileTap={inactionActive ? {} : { scale: 0.9 }}
              onClick={() => handleAction(key)}
              disabled={inactionActive}
              className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: CARD_BG,
                border: `1px solid ${CARD_BORDER}`,
              }}
              data-ocid={`cloud.action.button.${idx + 1}`}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: `${color.replace(")", " / 0.12)")}`,
                }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color }} />
              </div>
              <span className="text-[9px] font-body font-medium text-foreground/70 leading-tight text-center">
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Instance Manager ────────────────────── */}
      <div className="mx-3 mt-3">
        <p className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Instances
        </p>
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          {/* Header row */}
          <div
            className="flex items-center px-3 py-1.5"
            style={{
              background: SURFACE_BG,
              borderBottom: "1px solid oklch(0.22 0.025 255)",
            }}
          >
            <span className="flex-1 text-[9px] font-mono-code text-muted-foreground uppercase tracking-wider">
              Node
            </span>
            <span className="w-12 text-[9px] font-mono-code text-muted-foreground uppercase tracking-wider text-right">
              CPU
            </span>
            <span className="w-12 text-[9px] font-mono-code text-muted-foreground uppercase tracking-wider text-right">
              Mem
            </span>
            <span className="w-14 text-[9px] font-mono-code text-muted-foreground uppercase tracking-wider text-right">
              Status
            </span>
          </div>

          {INSTANCES.map((inst, idx) => {
            const cpuColor =
              inst.cpu >= 80 ? RED : inst.cpu >= 60 ? YELLOW : GREEN;
            const memColor =
              inst.mem >= 80 ? RED : inst.mem >= 60 ? YELLOW : CYAN;
            const statusColor =
              inst.status === "running"
                ? GREEN
                : inst.status === "stopped"
                  ? RED
                  : YELLOW;

            return (
              <div
                key={inst.name}
                className="flex items-center px-3 py-2 border-b last:border-0"
                style={{ borderColor: "oklch(0.22 0.025 255)" }}
                data-ocid={`cloud.instance.row.${idx + 1}`}
              >
                {/* Name + region */}
                <div className="flex-1 min-w-0 pr-1">
                  <p className="text-[10px] font-mono-code text-foreground truncate leading-tight">
                    {inst.name}
                  </p>
                  <p className="text-[9px] text-muted-foreground font-body truncate">
                    {inst.region}
                  </p>
                </div>

                {/* CPU */}
                <div className="w-12 flex flex-col items-end gap-0.5">
                  <span
                    className="text-[10px] font-mono-code"
                    style={{ color: cpuColor }}
                  >
                    {inst.cpu}%
                  </span>
                  <div className="w-10">
                    <MiniBar value={inst.cpu} color={cpuColor} height={2} />
                  </div>
                </div>

                {/* Mem */}
                <div className="w-12 flex flex-col items-end gap-0.5">
                  <span
                    className="text-[10px] font-mono-code"
                    style={{ color: memColor }}
                  >
                    {inst.mem}%
                  </span>
                  <div className="w-10">
                    <MiniBar value={inst.mem} color={memColor} height={2} />
                  </div>
                </div>

                {/* Status */}
                <div className="w-14 flex justify-end">
                  <span
                    className="text-[9px] font-mono-code flex items-center"
                    style={{ color: statusColor }}
                  >
                    <StatusDot status={inst.status} />
                    {inst.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Cost Tracker ────────────────────────── */}
      <div className="mx-3 mt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-widest">
            Monthly Cost
          </p>
          <span
            className="text-xs font-mono-code font-bold"
            style={{ color: CYAN }}
          >
            ${TOTAL_COST.toFixed(2)}
          </span>
        </div>
        <div
          className="rounded-xl p-3 space-y-2.5"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          data-ocid="cloud.cost.card"
        >
          {COSTS.map(({ label, amount, color, icon: Icon }, idx) => (
            <div
              key={label}
              className="flex items-center gap-2"
              data-ocid={`cloud.cost.item.${idx + 1}`}
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: `${color.replace(")", " / 0.12)")}` }}
              >
                <Icon className="w-2.5 h-2.5" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-body font-medium text-foreground/80">
                    {label}
                  </span>
                  <span
                    className="text-[10px] font-mono-code ml-2 flex-shrink-0"
                    style={{ color }}
                  >
                    ${amount.toFixed(2)}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-navy-raised overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(amount / TOTAL_COST) * 100}%` }}
                    transition={{
                      duration: 0.9,
                      ease: "easeOut",
                      delay: 0.1 * idx,
                    }}
                    style={{
                      background: color,
                      height: "100%",
                      borderRadius: 9999,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Total divider */}
          <div
            className="pt-1.5 mt-1 flex items-center justify-between"
            style={{ borderTop: "1px solid oklch(0.24 0.028 255)" }}
          >
            <span className="text-[10px] font-display font-semibold text-foreground/60 uppercase tracking-wider">
              Total / mo
            </span>
            <span
              className="text-sm font-display font-bold"
              style={{ color: CYAN }}
            >
              ${TOTAL_COST.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Storage Buckets ─────────────────────── */}
      <div className="mx-3 mt-3">
        <p className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Storage Buckets
        </p>
        <div className="space-y-2">
          {BUCKETS.map((bucket, idx) => {
            const pct = (bucket.used / bucket.total) * 100;
            const barColor = pct >= 85 ? RED : pct >= 65 ? YELLOW : CYAN;
            return (
              <div
                key={bucket.name}
                className="rounded-xl p-3"
                style={{
                  background: CARD_BG,
                  border: `1px solid ${CARD_BORDER}`,
                }}
                data-ocid={`cloud.bucket.item.${idx + 1}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{bucket.icon}</span>
                    <span className="text-[10px] font-mono-code text-foreground/80">
                      {bucket.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {pct >= 85 && (
                      <AlertTriangle
                        className="w-3 h-3"
                        style={{ color: RED }}
                      />
                    )}
                    <span
                      className="text-[10px] font-mono-code"
                      style={{ color: barColor }}
                    >
                      {bucket.used} TB / {bucket.total} TB
                    </span>
                  </div>
                </div>
                <Progress
                  value={pct}
                  className="h-1.5"
                  style={
                    {
                      "--progress-color": barColor,
                    } as React.CSSProperties
                  }
                />
                <p className="text-[9px] text-muted-foreground font-body mt-1">
                  {pct.toFixed(0)}% used
                  {pct >= 85 ? " · Low capacity warning" : ""}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Cloud Provider Badge ─────────────────── */}
      <div className="mx-3 mt-3 mb-3">
        <div
          className="rounded-xl p-3 flex items-center justify-between"
          style={{
            background: SURFACE_BG,
            border: "1px solid oklch(0.22 0.025 255)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
              style={{ background: CYAN }}
            />
            <span className="text-[10px] font-body text-muted-foreground">
              ICP Cloud Node Active
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <CloudUpload className="w-3 h-3" style={{ color: CYAN }} />
              <span className="text-[10px] font-mono-code text-muted-foreground">
                3 regions
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Box className="w-3 h-3" style={{ color: GREEN }} />
              <span className="text-[10px] font-mono-code text-muted-foreground">
                4 nodes
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MemoryStick className="w-3 h-3" style={{ color: YELLOW }} />
              <span className="text-[10px] font-mono-code text-muted-foreground">
                16 vCPU
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-2">
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
        className="text-center py-3 mt-1 mx-3 border-t"
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
