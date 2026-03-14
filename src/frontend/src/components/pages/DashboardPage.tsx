import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Battery,
  CheckCircle2,
  LockKeyhole,
  OctagonX,
  PiggyBank,
  Printer,
  Send,
  Shield,
  TrendingDown,
  TrendingUp,
  Wallet,
  Wifi,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import GlobePulse from "../GlobePulse";
import SovereignVisualizationEngine from "../SovereignVisualizationEngine";

const INDIA_BASE = 3_000_000_000_000;
const USA_BASE = 30_000_000_000_000;

function compoundValue(
  base: number,
  ratePercent: number,
  startMs: number,
): number {
  const elapsed = (Date.now() - startMs) / 1000;
  const perSecondRate = ratePercent / 100 / (365 * 24 * 3600);
  return base * (1 + perSecondRate * elapsed);
}

function formatLarge(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(4)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  return `$${n.toFixed(0)}`;
}

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const CATEGORY_ICONS: Record<string, string> = {
  Food: "🍔",
  Transport: "🚌",
  Shopping: "🛍️",
  Salary: "💰",
  Bills: "📋",
  Entertainment: "🎬",
  Other: "📦",
};

const SPENDING = [
  ["Food", 12800],
  ["Bills", 4500],
  ["Transport", 8900],
  ["Entertainment", 3200],
] as [string, number][];

const RECENT_TXS = [
  {
    desc: "Monthly Salary",
    cat: "Salary",
    date: "Mar 1",
    amount: 48250,
    credit: true,
  },
  {
    desc: "Grocery Shopping",
    cat: "Food",
    date: "Mar 3",
    amount: 12800,
    credit: false,
  },
  {
    desc: "Freelance Payment",
    cat: "Salary",
    date: "Mar 9",
    amount: 25000,
    credit: true,
  },
];

interface DashboardPageProps {
  onAccountReady?: () => void;
  vaultLocked?: boolean;
  bankModeActive?: boolean;
  inactionActive?: boolean;
  digitalSmileProfile?: "Generic" | "Non-Generic" | "Calibrating";
  onOpenPrintNote?: () => void;
}

export default function DashboardPage({
  vaultLocked = true,
  bankModeActive = true,
  inactionActive = false,
  digitalSmileProfile,
  onOpenPrintNote,
}: DashboardPageProps) {
  const startMs = useRef(Date.now());
  const [indiaRate, setIndiaRate] = useState(4.2);
  const [usaRate, setUsaRate] = useState(5.8);
  const [indiaValue, setIndiaValue] = useState(INDIA_BASE);
  const [usaValue, setUsaValue] = useState(USA_BASE);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndiaValue(compoundValue(INDIA_BASE, indiaRate, startMs.current));
      setUsaValue(compoundValue(USA_BASE, usaRate, startMs.current));
      setTick((p) => p + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [indiaRate, usaRate]);

  const maxSpending = Math.max(...SPENDING.map(([, v]) => v));

  return (
    <div className="pb-2 relative">
      {inactionActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 pointer-events-none"
          style={{
            background: "oklch(0.08 0.015 20 / 0.72)",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            className="flex flex-col items-center gap-2 px-6 py-5 rounded-2xl"
            style={{
              background: "oklch(0.12 0.03 20 / 0.9)",
              border: "1px solid oklch(0.62 0.2 18 / 0.5)",
              boxShadow: "0 0 32px oklch(0.62 0.2 18 / 0.3)",
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY }}
            >
              <OctagonX
                className="w-10 h-10"
                style={{ color: "oklch(0.75 0.18 18)" }}
              />
            </motion.div>
            <p
              className="font-display font-bold text-sm tracking-widest uppercase"
              style={{ color: "oklch(0.75 0.18 18)" }}
            >
              INACTION SAFETY
            </p>
            <p
              className="text-[10px] font-mono-code text-center"
              style={{ color: "oklch(0.55 0.1 18)" }}
            >
              All banking actions locked
            </p>
          </div>
        </motion.div>
      )}

      {/* NWOS Header */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p
              className="text-sm font-display font-black tracking-wider"
              style={{ color: "oklch(0.88 0.1 75)" }}
            >
              MOIRA NWOS
            </p>
            <p
              className="text-[10px] font-body"
              style={{ color: "oklch(0.55 0.08 255)" }}
            >
              National Wealth Operating System v20
            </p>
          </div>
          <Badge
            style={{
              background: "oklch(0.22 0.04 75 / 0.4)",
              border: "1px solid oklch(0.55 0.1 75 / 0.5)",
              color: "oklch(0.88 0.1 75)",
              fontSize: "9px",
            }}
          >
            SOVEREIGN YIELD ACTIVE
          </Badge>
        </div>
        <p
          className="text-[10px] font-mono-code"
          style={{ color: "oklch(0.5 0.08 200)" }}
        >
          Sovereign Asset Intelligence — India $3T | USA $30T
        </p>
      </div>

      {/* Account Card */}
      <div
        className="relative overflow-hidden mx-3 rounded-2xl p-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.05 255) 0%, oklch(0.16 0.03 255) 60%, oklch(0.20 0.04 255) 100%)",
          border: "1px solid oklch(0.3 0.04 255)",
        }}
      >
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, oklch(0.78 0.12 75), transparent 70%)",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground font-body uppercase tracking-widest">
                Available Balance
              </p>
              <motion.p
                key={tick}
                className={`font-display font-bold text-3xl text-foreground mt-0.5 tracking-tight transition-all duration-300 ${vaultLocked ? "blur-md select-none" : ""}`}
              >
                {formatINR(482500)}
              </motion.p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="w-8 h-8 rounded-lg bg-gold/20 border border-gold/30 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-gold" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] border-gold/30 text-gold bg-gold/10 font-mono-code"
              >
                NWOS
              </Badge>
            </div>
          </div>
          <p
            className={`font-mono-code text-xs text-muted-foreground transition-all duration-300 ${vaultLocked ? "blur-sm select-none" : ""}`}
          >
            MOIRA-NWOS-001
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
              style={{
                background: bankModeActive
                  ? "oklch(0.62 0.18 150 / 0.12)"
                  : "oklch(0.22 0.025 255 / 0.4)",
                border: bankModeActive
                  ? "1px solid oklch(0.62 0.18 150 / 0.35)"
                  : "1px solid oklch(0.28 0.03 255)",
              }}
            >
              {bankModeActive && (
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "oklch(0.7 0.18 150)" }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              )}
              <span
                className="text-[9px] font-mono-code font-bold tracking-widest uppercase"
                style={{
                  color: bankModeActive
                    ? "oklch(0.75 0.17 150)"
                    : "oklch(0.45 0.03 255)",
                }}
              >
                {bankModeActive ? "Bank Mode ON" : "Bank Mode OFF"}
              </span>
            </div>
          </div>
          {vaultLocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-sm"
                style={{
                  background: "oklch(0.1 0.02 255 / 0.7)",
                  border: "1px solid oklch(0.62 0.2 18 / 0.4)",
                }}
              >
                <LockKeyhole
                  className="w-3 h-3"
                  style={{ color: "oklch(0.75 0.18 18)" }}
                />
                <span
                  className="text-[10px] font-mono-code font-bold tracking-widest"
                  style={{ color: "oklch(0.75 0.18 18)" }}
                >
                  VAULT LOCKED
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* 3D Globe */}
      <div className="px-3 mt-3">
        <GlobePulse />
      </div>

      {/* SOVEREIGN VISUALIZATION ENGINE - v24 */}
      <SovereignVisualizationEngine />

      {/* WEALTH ALGORITHM PANEL */}
      <div
        className="mx-3 mt-3 rounded-xl overflow-hidden"
        style={{
          border: "1px solid oklch(0.35 0.06 75 / 0.5)",
          background: "oklch(0.13 0.025 255)",
        }}
      >
        <div
          className="px-3 py-2.5 border-b"
          style={{
            borderColor: "oklch(0.22 0.025 255)",
            background:
              "linear-gradient(90deg, oklch(0.16 0.035 75 / 0.5), oklch(0.14 0.025 255))",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap
                className="w-4 h-4"
                style={{ color: "oklch(0.78 0.12 75)" }}
              />
              <p
                className="text-xs font-display font-bold"
                style={{ color: "oklch(0.92 0.1 75)" }}
              >
                WEALTH ALGORITHM
              </p>
            </div>
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                background: "oklch(0.22 0.04 75 / 0.3)",
                border: "1px solid oklch(0.55 0.1 75 / 0.4)",
              }}
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "oklch(0.78 0.12 75)" }}
              />
              <span
                className="text-[9px] font-mono-code font-bold"
                style={{ color: "oklch(0.88 0.1 75)" }}
              >
                SOVEREIGN YIELD ACTIVE
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-4">
          {/* India Pool */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🇮🇳</span>
                <span
                  className="text-xs font-display font-semibold"
                  style={{ color: "oklch(0.72 0.16 55)" }}
                >
                  India National Pool
                </span>
              </div>
              <Badge
                style={{
                  background: "oklch(0.72 0.16 55 / 0.15)",
                  border: "1px solid oklch(0.72 0.16 55 / 0.4)",
                  color: "oklch(0.72 0.16 55)",
                  fontSize: "9px",
                }}
              >
                {indiaRate.toFixed(1)}% p.a.
              </Badge>
            </div>
            <motion.p
              key={`india-${tick}`}
              initial={{ opacity: 0.8, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-display font-black font-mono-code"
              style={{ color: "oklch(0.88 0.14 55)" }}
            >
              {formatLarge(indiaValue)}
            </motion.p>
            <div className="mt-1.5">
              <div
                className="flex justify-between text-[9px] font-mono-code mb-1"
                style={{ color: "oklch(0.5 0.06 255)" }}
              >
                <span>Yield Rate</span>
                <span>{indiaRate.toFixed(1)}%</span>
              </div>
              <Slider
                data-ocid="dashboard.india_yield.slider"
                min={0.5}
                max={12}
                step={0.1}
                value={[indiaRate]}
                onValueChange={([v]) => {
                  setIndiaRate(v);
                  startMs.current = Date.now();
                  setIndiaValue(INDIA_BASE);
                }}
                disabled={inactionActive}
                className="w-full"
              />
            </div>
            <p
              className="text-[9px] font-mono-code mt-1"
              style={{ color: "oklch(0.55 0.08 55)" }}
            >
              Turnaround: {formatLarge((INDIA_BASE * indiaRate) / 100)} / yr ·
              Real-time compound active
            </p>
          </div>

          <div style={{ height: 1, background: "oklch(0.22 0.025 255)" }} />

          {/* USA Pool */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🇺🇸</span>
                <span
                  className="text-xs font-display font-semibold"
                  style={{ color: "oklch(0.6 0.18 200)" }}
                >
                  USA National Pool
                </span>
              </div>
              <Badge
                style={{
                  background: "oklch(0.6 0.18 200 / 0.15)",
                  border: "1px solid oklch(0.6 0.18 200 / 0.4)",
                  color: "oklch(0.72 0.14 200)",
                  fontSize: "9px",
                }}
              >
                {usaRate.toFixed(1)}% p.a.
              </Badge>
            </div>
            <motion.p
              key={`usa-${tick}`}
              initial={{ opacity: 0.8, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-display font-black font-mono-code"
              style={{ color: "oklch(0.78 0.16 200)" }}
            >
              {formatLarge(usaValue)}
            </motion.p>
            <div className="mt-1.5">
              <div
                className="flex justify-between text-[9px] font-mono-code mb-1"
                style={{ color: "oklch(0.5 0.06 255)" }}
              >
                <span>Yield Rate</span>
                <span>{usaRate.toFixed(1)}%</span>
              </div>
              <Slider
                data-ocid="dashboard.usa_yield.slider"
                min={0.5}
                max={12}
                step={0.1}
                value={[usaRate]}
                onValueChange={([v]) => {
                  setUsaRate(v);
                  startMs.current = Date.now();
                  setUsaValue(USA_BASE);
                }}
                disabled={inactionActive}
                className="w-full"
              />
            </div>
            <p
              className="text-[9px] font-mono-code mt-1"
              style={{ color: "oklch(0.5 0.1 200)" }}
            >
              Turnaround: {formatLarge((USA_BASE * usaRate) / 100)} / yr ·
              Real-time compound active
            </p>
          </div>
        </div>
      </div>

      {/* Print Note */}
      {onOpenPrintNote && (
        <div className="mx-3 mt-3">
          <Button
            data-ocid="dashboard.print_note.primary_button"
            onClick={onOpenPrintNote}
            disabled={inactionActive}
            className="w-full flex items-center justify-center gap-2 py-2.5 font-display font-semibold text-sm tracking-wide disabled:opacity-40"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.22 0.04 75), oklch(0.18 0.03 75))",
              border: "1px solid oklch(0.45 0.08 75 / 0.5)",
              color: "oklch(0.88 0.1 75)",
            }}
          >
            <Printer className="w-4 h-4" /> Print Account Note
          </Button>
        </div>
      )}

      {/* Digital Smile Welcome */}
      <AnimatePresence mode="wait">
        {(digitalSmileProfile === "Generic" ||
          digitalSmileProfile === undefined) && (
          <motion.div
            key="generic"
            data-ocid="dashboard.digital_smile.card"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mx-3 mt-3 rounded-xl px-3 py-2.5 flex items-center gap-2.5"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.16 0.03 150 / 0.5), oklch(0.14 0.025 200 / 0.4))",
              border: "1px solid oklch(0.45 0.14 150 / 0.25)",
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "oklch(0.62 0.18 150 / 0.15)",
                border: "1px solid oklch(0.62 0.18 150 / 0.3)",
              }}
            >
              <CheckCircle2
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.7 0.17 150)" }}
              />
            </div>
            <div>
              <p
                className="text-[11px] font-display font-semibold"
                style={{ color: "oklch(0.88 0.06 150)" }}
              >
                Welcome back. Your relationship is secure.
              </p>
              <p
                className="text-[9px] font-mono-code mt-0.5"
                style={{ color: "oklch(0.6 0.12 150)" }}
              >
                Di=AI DIGITAL SMILE · GENERIC BEHAVIOR CONFIRMED
              </p>
            </div>
          </motion.div>
        )}
        {digitalSmileProfile === "Non-Generic" && (
          <motion.div
            key="non-generic"
            data-ocid="dashboard.digital_smile.card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mt-3 rounded-xl px-3 py-2.5 flex items-center gap-2.5"
            style={{
              background: "oklch(0.14 0.025 75 / 0.6)",
              border: "1px solid oklch(0.55 0.1 75 / 0.3)",
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "oklch(0.78 0.12 75 / 0.15)",
                border: "1px solid oklch(0.78 0.12 75 / 0.3)",
              }}
            >
              <Shield
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.78 0.12 75)" }}
              />
            </motion.div>
            <div>
              <p
                className="text-[11px] font-display font-semibold"
                style={{ color: "oklch(0.85 0.1 75)" }}
              >
                Security review in progress…
              </p>
              <p
                className="text-[9px] font-mono-code mt-0.5"
                style={{ color: "oklch(0.6 0.1 75)" }}
              >
                BEHAVIORAL ANOMALY · INACTION ENGAGED
              </p>
            </div>
          </motion.div>
        )}
        {digitalSmileProfile === "Calibrating" && (
          <motion.div
            key="calibrating"
            data-ocid="dashboard.digital_smile.card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mt-3 rounded-xl px-3 py-2.5 flex items-center gap-2.5"
            style={{
              background: "oklch(0.13 0.018 255 / 0.6)",
              border: "1px solid oklch(0.35 0.06 255 / 0.3)",
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "oklch(0.55 0.15 255 / 0.12)",
                border: "1px solid oklch(0.45 0.1 255 / 0.25)",
              }}
            >
              <Activity
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.55 0.15 255)" }}
              />
            </div>
            <div>
              <p
                className="text-[11px] font-display font-semibold"
                style={{ color: "oklch(0.72 0.08 255)" }}
              >
                Analyzing your session…
              </p>
              <p
                className="text-[9px] font-mono-code mt-0.5"
                style={{ color: "oklch(0.5 0.08 255)" }}
              >
                CALIBRATING BEHAVIORAL DNA · DI=AI LEARNING
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-2 mx-3 mt-3">
        {[
          {
            label: "Income",
            value: formatINR(73250),
            icon: TrendingUp,
            color: "oklch(0.65 0.16 150)",
            bg: "oklch(0.65 0.16 150 / 0.1)",
          },
          {
            label: "Expenses",
            value: formatINR(29400),
            icon: TrendingDown,
            color: "oklch(0.65 0.22 15)",
            bg: "oklch(0.65 0.22 15 / 0.1)",
          },
          {
            label: "Savings %",
            value: "60%",
            icon: PiggyBank,
            color: "oklch(0.78 0.12 75)",
            bg: "oklch(0.78 0.12 75 / 0.1)",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-xl p-2.5"
            style={{
              background: "oklch(0.16 0.022 255)",
              border: "1px solid oklch(0.26 0.03 255)",
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center mb-1.5"
              style={{ background: bg }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color }} />
            </div>
            <p className="font-display font-bold text-sm text-foreground leading-tight">
              {value}
            </p>
            <p className="text-[10px] text-muted-foreground font-body">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mx-3 mt-3">
        <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Quick Actions
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              label: "Transfer",
              icon: ArrowUpRight,
              color: "oklch(0.65 0.16 150)",
            },
            { label: "Pay", icon: Send, color: "oklch(0.65 0.22 15)" },
            { label: "Save", icon: PiggyBank, color: "oklch(0.78 0.12 75)" },
            { label: "Invest", icon: BarChart3, color: "oklch(0.6 0.18 200)" },
          ].map(({ label, icon: Icon, color }) => (
            <motion.button
              key={label}
              whileTap={inactionActive ? {} : { scale: 0.92 }}
              disabled={inactionActive}
              onClick={() => {
                if (!inactionActive)
                  toast.info(`${label} — use Transactions tab`);
              }}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-colors disabled:opacity-40"
              style={{
                background: "oklch(0.16 0.022 255)",
                border: "1px solid oklch(0.26 0.03 255)",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: `oklch(${color.split("oklch(")[1].replace(")", "")} / 0.15)`,
                }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-[10px] font-body font-medium text-foreground/80">
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Spending */}
      <div className="mx-3 mt-3">
        <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Spending by Category
        </p>
        <div
          className="rounded-xl p-3 space-y-2"
          style={{
            background: "oklch(0.16 0.022 255)",
            border: "1px solid oklch(0.26 0.03 255)",
          }}
        >
          {SPENDING.map(([cat, amount]) => (
            <div key={cat} className="flex items-center gap-2">
              <span className="text-base w-6 flex-shrink-0">
                {CATEGORY_ICONS[cat] ?? "📦"}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-body font-medium text-foreground/80">
                    {cat}
                  </span>
                  <span className="text-xs font-mono-code text-gold ml-2">
                    {formatINR(amount)}
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.22 0.025 255)" }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(amount / maxSpending) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, oklch(0.78 0.12 75), oklch(0.65 0.16 150))",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mx-3 mt-3">
        <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Recent Activity
        </p>
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "oklch(0.16 0.022 255)",
            border: "1px solid oklch(0.26 0.03 255)",
          }}
        >
          {RECENT_TXS.map((tx, idx) => (
            <div
              key={tx.desc}
              data-ocid={`dashboard.transactions.item.${idx + 1}`}
              className="flex items-center gap-3 px-3 py-2.5 border-b last:border-0"
              style={{ borderColor: "oklch(0.22 0.025 255)" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: "oklch(0.2 0.025 255)" }}
              >
                {CATEGORY_ICONS[tx.cat] ?? "📦"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-body font-medium text-foreground truncate">
                  {tx.desc}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {tx.cat} · {tx.date}
                </p>
              </div>
              <p
                className="text-xs font-mono-code font-semibold flex-shrink-0"
                style={{
                  color: tx.credit
                    ? "oklch(0.65 0.16 150)"
                    : "oklch(0.65 0.22 15)",
                }}
              >
                {tx.credit ? "+" : "-"}
                {formatINR(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sensor Status */}
      <div className="mx-3 mt-3 mb-3">
        <div
          className="rounded-xl p-3 flex items-center justify-between"
          style={{
            background: "oklch(0.14 0.02 255)",
            border: "1px solid oklch(0.22 0.025 255)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.65_0.16_150)] animate-pulse-dot" />
            <span className="text-[10px] font-body text-muted-foreground">
              Sensor Active
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-[oklch(0.65_0.16_150)]" />
              <span className="text-[10px] font-mono-code text-muted-foreground">
                {navigator.onLine ? "Online" : "Offline"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Battery className="w-3 h-3 text-gold" />
              <span className="text-[10px] font-mono-code text-muted-foreground">
                Monitoring
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-[oklch(0.6_0.18_200)]" />
              <span className="text-[10px] font-mono-code text-muted-foreground">
                Motion
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pb-3">
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
      <div
        className="text-center py-3 border-t"
        style={{ borderColor: "oklch(0.22 0.025 255)" }}
      >
        <p
          className="text-[9px] font-mono-code"
          style={{ color: "oklch(0.4 0.04 255)" }}
        >
          © P.S. Thimaia · CC BY-NC-ND · Make in India · Powered by 26.ai
        </p>
      </div>
    </div>
  );
}
