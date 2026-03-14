import {
  CheckCircle2,
  CreditCard,
  Lock,
  LockKeyhole,
  Shield,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import MSimTelemetryDashboard from "../MSimTelemetryDashboard";

interface Props {
  inactionActive: boolean;
}

type SessionState = "locked" | "unlocking" | "active" | "sealing";

interface LogEntry {
  id: string;
  timestamp: string;
  description: string;
  amount: string;
  type: "credit" | "debit" | "neutral";
}

const INITIAL_LOG: LogEntry[] = [
  {
    id: "init-4",
    timestamp: "09 Mar 2026 · 00:01 IST",
    description: "Strong Room Initialised",
    amount: "—",
    type: "neutral",
  },
  {
    id: "init-3",
    timestamp: "09 Mar 2026 · 06:15 IST",
    description: "Protected Funds Designation",
    amount: "₹ 8,75,000.00",
    type: "debit",
  },
  {
    id: "init-2",
    timestamp: "09 Mar 2026 · 08:30 IST",
    description: "GOI Escrow Allocation",
    amount: "₹ 2,50,000.00",
    type: "debit",
  },
  {
    id: "init-1",
    timestamp: "09 Mar 2026 · 10:00 IST",
    description: "Sovereign Reserve Funded",
    amount: "₹ 12,50,000.00",
    type: "credit",
  },
];

const VIOLET_ACCENT = "oklch(0.62 0.22 290)";
const VIOLET_BRIGHT = "oklch(0.82 0.16 290)";
const VIOLET_DARK = "oklch(0.09 0.018 290)";
const VIOLET_CARD = "oklch(0.13 0.022 290)";
const VIOLET_BORDER = "oklch(0.28 0.06 290)";
const VIOLET_GLOW = "oklch(0.62 0.22 290 / 0.3)";
const GREEN_SEAL = "oklch(0.72 0.18 155)";

function formatTimestamp(): string {
  const now = new Date();
  return `${now.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  })} IST`;
}

// ── Signal bars widget ──────────────────────────────────────
function SignalBars() {
  const [lit, setLit] = useState(3);

  useEffect(() => {
    const t = setInterval(() => {
      setLit(Math.random() > 0.2 ? 4 : 3);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-end gap-[2px]">
      {[1, 2, 3, 4].map((bar) => (
        <motion.div
          key={bar}
          animate={{ opacity: bar <= lit ? 1 : 0.2 }}
          transition={{ duration: 0.3 }}
          style={{
            width: 3,
            height: 4 + bar * 3,
            borderRadius: 2,
            background: bar <= lit ? VIOLET_ACCENT : VIOLET_BORDER,
          }}
        />
      ))}
    </div>
  );
}

// ── Vault-close ring animation ──────────────────────────────
function SealAnimation({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 1600);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: `${VIOLET_DARK}f5` }}
    >
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 1.8, opacity: 0 }}
          animate={{ scale: 0.2, opacity: [0, 0.7, 0] }}
          transition={{
            delay: i * 0.18,
            duration: 0.9,
            ease: "easeIn",
          }}
          className="absolute rounded-full"
          style={{
            width: 120 + i * 60,
            height: 120 + i * 60,
            border: `2px solid ${VIOLET_ACCENT}`,
            boxShadow: `0 0 24px ${VIOLET_GLOW}`,
          }}
        />
      ))}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 1] }}
        transition={{ delay: 0.35, duration: 0.7, ease: "backOut" }}
        className="relative z-10 flex flex-col items-center gap-3"
      >
        <LockKeyhole style={{ color: VIOLET_ACCENT, width: 48, height: 48 }} />
        <span
          className="font-mono text-sm font-bold tracking-widest uppercase"
          style={{ color: VIOLET_BRIGHT }}
        >
          Strong Room Sealed
        </span>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ───────────────────────────────────────────────
export default function MSimStrongRoomPage({ inactionActive }: Props) {
  const [sessionState, setSessionState] = useState<SessionState>("locked");
  const [activationCode, setActivationCode] = useState("");
  const [activationError, setActivationError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [shakeActive, setShakeActive] = useState(false);

  // Transfer form
  const [transferTo, setTransferTo] = useState("primary");
  const [transferAmount, setTransferAmount] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState(false);

  const [log, setLog] = useState<LogEntry[]>(INITIAL_LOG);
  const shakeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (shakeRef.current) clearTimeout(shakeRef.current);
    };
  }, []);

  const triggerShake = () => {
    setShakeActive(true);
    shakeRef.current = setTimeout(() => setShakeActive(false), 520);
  };

  const handleActivate = () => {
    if (inactionActive) return;
    if (activationCode.trim().toUpperCase() === "MSIM-MOIRA") {
      setActivationError("");
      setSessionState("unlocking");
      setTimeout(() => setSessionState("active"), 1400);
    } else {
      setFailedAttempts((n) => n + 1);
      const count = failedAttempts + 1;
      setActivationError(
        `Invalid activation code. ${count} failed attempt${count !== 1 ? "s" : ""}.`,
      );
      triggerShake();
    }
  };

  const handleSeal = () => {
    if (inactionActive) return;
    setSessionState("sealing");
  };

  const handleSealComplete = () => {
    setSessionState("locked");
    setActivationCode("");
    setActivationError("");
    setFailedAttempts(0);
    setPin("");
    setPinError("");
    setTransferAmount("");
    setTransferSuccess(false);
  };

  const destinationLabel: Record<string, string> = {
    primary: "Primary Account",
    swift: "External SWIFT",
    escrow: "GOI Escrow",
  };

  const handleTransfer = () => {
    if (inactionActive) return;
    if (pin !== "2626") {
      setPinError("Invalid M.Sim PIN. Transaction blocked.");
      return;
    }
    if (!transferAmount || Number.isNaN(Number(transferAmount))) {
      setPinError("Enter a valid amount.");
      return;
    }
    setPinError("");
    const dest = destinationLabel[transferTo] ?? transferTo;
    const amtFormatted = `₹ ${Number(transferAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}.00`;
    const entry: LogEntry = {
      id: `tx-${Date.now()}`,
      timestamp: formatTimestamp(),
      description: `Transfer → ${dest}`,
      amount: amtFormatted,
      type: "debit",
    };
    setLog((prev) => [entry, ...prev]);
    setTransferAmount("");
    setPin("");
    setTransferSuccess(true);
    setTimeout(() => setTransferSuccess(false), 3000);
    toast.success("Transfer logged to Strong Room ledger", {
      description: `${amtFormatted} → ${dest}`,
      duration: 3500,
    });
  };

  // ── Activation Gate ─────────────────────────────────────────
  if (sessionState === "locked") {
    return (
      <>
        <AnimatePresence>
          {shakeActive && (
            <motion.div
              key="shake-overlay"
              animate={{ x: [0, -8, 8, -6, 6, -4, 4, 0] }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 pointer-events-none"
            />
          )}
        </AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-full px-6 py-10"
          style={{ background: VIOLET_DARK }}
        >
          {/* Ambient glow rings */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 280,
                height: 280,
                background: `radial-gradient(circle, ${VIOLET_GLOW} 0%, transparent 70%)`,
              }}
            />
          </div>

          {/* SIM card icon */}
          <motion.div
            animate={shakeActive ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.45 }}
            className="relative mb-8"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: VIOLET_CARD,
                border: `2px solid ${VIOLET_BORDER}`,
                boxShadow: `0 0 32px ${VIOLET_GLOW}, inset 0 1px 0 oklch(0.62 0.22 290 / 0.1)`,
              }}
            >
              <CreditCard
                style={{ color: VIOLET_ACCENT, width: 40, height: 40 }}
              />
            </div>
            {/* Lock overlay */}
            <div
              className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                background: VIOLET_DARK,
                border: `1.5px solid ${VIOLET_BORDER}`,
              }}
            >
              <Lock style={{ color: VIOLET_BRIGHT, width: 14, height: 14 }} />
            </div>
          </motion.div>

          <h1
            className="text-2xl font-display font-bold tracking-tight mb-1 text-center"
            style={{ color: VIOLET_BRIGHT }}
          >
            M.Sim Strong Room
          </h1>
          <p
            className="text-xs text-center mb-8"
            style={{ color: "oklch(0.55 0.08 290)" }}
          >
            Secured sovereign banking chamber · Moira Labs
          </p>

          {/* Activation form */}
          <div
            className="w-full max-w-xs rounded-2xl p-5 flex flex-col gap-4"
            style={{
              background: VIOLET_CARD,
              border: `1px solid ${VIOLET_BORDER}`,
              boxShadow: "0 8px 32px oklch(0 0 0 / 0.5)",
            }}
          >
            <label
              htmlFor="msim-activation-code"
              className="text-[10px] font-mono uppercase tracking-widest"
              style={{ color: "oklch(0.55 0.1 290)" }}
            >
              M.Sim Activation Code
            </label>
            <input
              id="msim-activation-code"
              data-ocid="msim.activate_input"
              type="text"
              value={activationCode}
              onChange={(e) => {
                setActivationCode(e.target.value.toUpperCase());
                setActivationError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleActivate()}
              disabled={inactionActive}
              placeholder="MSIM-XXXXX"
              className="w-full px-4 py-3 rounded-xl text-sm font-mono tracking-widest text-center outline-none transition-all placeholder:opacity-30 disabled:opacity-40"
              style={{
                background: "oklch(0.08 0.016 290)",
                border: activationError
                  ? "1.5px solid oklch(0.62 0.22 18)"
                  : `1.5px solid ${VIOLET_BORDER}`,
                color: VIOLET_BRIGHT,
                letterSpacing: "0.25em",
              }}
            />

            <AnimatePresence>
              {activationError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-[11px] font-mono"
                  style={{ color: "oklch(0.75 0.18 18)" }}
                >
                  {activationError}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              data-ocid="msim.activate_button"
              type="button"
              onClick={handleActivate}
              disabled={inactionActive || !activationCode}
              className="w-full py-3 rounded-xl font-display font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.2 290) 0%, oklch(0.62 0.22 290) 100%)",
                color: "oklch(0.97 0.01 290)",
                boxShadow: activationCode
                  ? `0 4px 24px ${VIOLET_GLOW}`
                  : "none",
                border: "1px solid oklch(0.65 0.22 290 / 0.6)",
                transition: "all 0.2s ease",
              }}
            >
              Activate Strong Room
            </button>
          </div>

          {/* Security note */}
          <p
            className="text-[10px] text-center mt-6 font-mono"
            style={{ color: "oklch(0.38 0.06 290)" }}
          >
            <Shield
              style={{
                display: "inline",
                width: 10,
                height: 10,
                marginRight: 4,
                verticalAlign: "middle",
                color: "oklch(0.45 0.1 290)",
              }}
            />
            M.Sim channel encrypted · SR-MOIRA-2626
          </p>
        </motion.div>
      </>
    );
  }

  // ── Unlocking animation ─────────────────────────────────────
  if (sessionState === "unlocking") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-full"
        style={{ background: VIOLET_DARK }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 1.15, 1], opacity: 1 }}
          transition={{ duration: 0.8, ease: "backOut" }}
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{
            background: `radial-gradient(circle, oklch(0.25 0.1 290) 0%, ${VIOLET_CARD} 100%)`,
            border: `2px solid ${VIOLET_ACCENT}`,
            boxShadow: `0 0 48px ${VIOLET_GLOW}, 0 0 96px oklch(0.62 0.22 290 / 0.12)`,
          }}
        >
          <motion.div
            animate={{ rotate: [0, 15, -10, 0] }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <LockKeyhole
              style={{ color: VIOLET_BRIGHT, width: 40, height: 40 }}
            />
          </motion.div>
        </motion.div>

        {/* Expanding rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{
              delay: 0.2 + i * 0.25,
              duration: 0.9,
              ease: "easeOut",
            }}
            className="absolute rounded-full"
            style={{
              width: 96,
              height: 96,
              border: `1.5px solid ${VIOLET_ACCENT}`,
            }}
          />
        ))}

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-mono text-sm tracking-widest uppercase"
          style={{ color: VIOLET_BRIGHT }}
        >
          Activating Strong Room…
        </motion.p>
      </motion.div>
    );
  }

  // ── Active state (with sealing overlay when sessionState === "sealing") ──
  return (
    <>
      <AnimatePresence>
        {sessionState === "sealing" && (
          <SealAnimation onComplete={handleSealComplete} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col min-h-full pb-4"
        style={{ background: VIOLET_DARK }}
      >
        {/* ── Strong Room Header ──────────────────────── */}
        <div
          className="sticky top-0 z-10 px-4 py-3"
          style={{
            background: `linear-gradient(180deg, ${VIOLET_CARD} 0%, oklch(0.11 0.02 290) 100%)`,
            borderBottom: `1px solid ${VIOLET_BORDER}`,
            boxShadow: "0 4px 20px oklch(0 0 0 / 0.4)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2
                className="text-base font-display font-bold tracking-tight"
                style={{ color: VIOLET_BRIGHT }}
              >
                M.Sim STRONG ROOM
              </h2>
              <div
                className="flex items-center gap-1.5 mt-0.5 px-2 py-0.5 rounded-full w-fit"
                style={{
                  background: "oklch(0.62 0.22 290 / 0.1)",
                  border: "1px solid oklch(0.62 0.22 290 / 0.25)",
                }}
              >
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{
                    duration: 1.6,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: VIOLET_ACCENT }}
                />
                <span
                  className="text-[9px] font-mono uppercase tracking-widest"
                  style={{ color: VIOLET_ACCENT }}
                >
                  SECURE CHANNEL: ACTIVE
                </span>
              </div>
            </div>

            {/* Right: signal + badge */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5">
                <SignalBars />
                <span
                  className="text-[9px] font-mono uppercase"
                  style={{ color: "oklch(0.55 0.1 290)" }}
                >
                  STRONG
                </span>
              </div>
              <span
                className="text-[8px] font-mono"
                style={{ color: "oklch(0.42 0.08 290)" }}
              >
                Secured by M.Sim · Moira Labs
              </span>
            </div>
          </div>
        </div>

        <MSimTelemetryDashboard />

        <div className="flex flex-col gap-4 px-4 pt-4">
          {/* ── Sovereign Reserve Card ──────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.11 0.025 290) 0%, oklch(0.15 0.035 290) 100%)",
              border: `1px solid ${VIOLET_BORDER}`,
              boxShadow:
                "0 8px 32px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(0.62 0.22 290 / 0.08)",
            }}
          >
            {/* Violet gradient top border */}
            <div
              style={{
                height: 3,
                background: `linear-gradient(90deg, transparent 0%, ${VIOLET_ACCENT} 40%, oklch(0.72 0.2 270) 100%)`,
              }}
            />

            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p
                    className="text-[10px] font-mono uppercase tracking-widest mb-1"
                    style={{ color: "oklch(0.5 0.1 290)" }}
                  >
                    Sovereign Reserve Balance
                  </p>
                  <p
                    className="text-3xl font-display font-bold tracking-tight"
                    style={{
                      color: VIOLET_BRIGHT,
                      textShadow: "0 0 20px oklch(0.62 0.22 290 / 0.4)",
                    }}
                  >
                    ₹ 12,50,000.00
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "oklch(0.62 0.22 290 / 0.12)",
                    border: "1px solid oklch(0.62 0.22 290 / 0.3)",
                  }}
                >
                  <CreditCard
                    style={{ color: VIOLET_ACCENT, width: 18, height: 18 }}
                  />
                </div>
              </div>

              {/* Protected funds badge */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                  style={{
                    background: "oklch(0.62 0.22 290 / 0.08)",
                    border: `1px solid ${VIOLET_BORDER}`,
                  }}
                >
                  <Lock
                    style={{ color: VIOLET_ACCENT, width: 11, height: 11 }}
                  />
                  <span
                    className="text-[10px] font-mono"
                    style={{ color: "oklch(0.68 0.14 290)" }}
                  >
                    Protected Funds
                  </span>
                  <span
                    className="text-[11px] font-display font-bold"
                    style={{ color: VIOLET_BRIGHT }}
                  >
                    ₹ 8,75,000.00
                  </span>
                </div>
              </div>

              {/* Strong Room ID */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-[9px] font-mono uppercase tracking-widest"
                  style={{ color: "oklch(0.4 0.07 290)" }}
                >
                  Strong Room ID
                </span>
                <span
                  className="text-[11px] font-mono font-bold"
                  style={{
                    color: VIOLET_ACCENT,
                    letterSpacing: "0.12em",
                  }}
                >
                  SR-MOIRA-2626
                </span>
              </div>

              <p
                className="text-[9px] font-mono mb-5"
                style={{ color: "oklch(0.38 0.06 290)" }}
              >
                Funds are ring-fenced and isolated from primary account
              </p>

              {/* Seal button */}
              <button
                data-ocid="msim.seal_button"
                type="button"
                onClick={handleSeal}
                disabled={inactionActive}
                className="w-full py-2.5 rounded-xl font-display font-bold text-xs tracking-widest uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "oklch(0.62 0.22 290 / 0.1)",
                  border: `1.5px solid ${VIOLET_BORDER}`,
                  color: VIOLET_BRIGHT,
                }}
              >
                <LockKeyhole
                  style={{
                    display: "inline",
                    width: 12,
                    height: 12,
                    marginRight: 6,
                    verticalAlign: "middle",
                  }}
                />
                Seal Strong Room
              </button>
            </div>
          </motion.div>

          {/* ── Transfer Panel ──────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="rounded-2xl p-5"
            style={{
              background: VIOLET_CARD,
              border: `1px solid ${VIOLET_BORDER}`,
            }}
          >
            <h3
              className="text-[11px] font-mono uppercase tracking-widest mb-4"
              style={{ color: "oklch(0.55 0.1 290)" }}
            >
              Transfer within Strong Room
            </h3>

            <div className="flex flex-col gap-3">
              {/* From (display-only, no label needed) */}
              <div>
                <p
                  className="text-[9px] font-mono uppercase tracking-widest block mb-1"
                  style={{ color: "oklch(0.45 0.08 290)" }}
                >
                  From
                </p>
                <div
                  className="px-3 py-2.5 rounded-xl text-sm font-mono"
                  style={{
                    background: "oklch(0.1 0.018 290)",
                    border: "1px solid oklch(0.22 0.04 290)",
                    color: "oklch(0.5 0.08 290)",
                  }}
                >
                  Sovereign Reserve
                </div>
              </div>

              {/* To */}
              <div>
                <label
                  htmlFor="msim-transfer-to"
                  className="text-[9px] font-mono uppercase tracking-widest block mb-1"
                  style={{ color: "oklch(0.45 0.08 290)" }}
                >
                  To
                </label>
                <select
                  id="msim-transfer-to"
                  data-ocid="msim.transfer.to_select"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  disabled={inactionActive}
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-mono outline-none appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "oklch(0.08 0.016 290)",
                    border: `1.5px solid ${VIOLET_BORDER}`,
                    color: VIOLET_BRIGHT,
                  }}
                >
                  <option value="primary" style={{ background: "#0f0a1e" }}>
                    Primary Account
                  </option>
                  <option value="swift" style={{ background: "#0f0a1e" }}>
                    External SWIFT
                  </option>
                  <option value="escrow" style={{ background: "#0f0a1e" }}>
                    GOI Escrow
                  </option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label
                  htmlFor="msim-transfer-amount"
                  className="text-[9px] font-mono uppercase tracking-widest block mb-1"
                  style={{ color: "oklch(0.45 0.08 290)" }}
                >
                  Amount (₹)
                </label>
                <input
                  id="msim-transfer-amount"
                  data-ocid="msim.transfer.amount_input"
                  type="number"
                  min="1"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  disabled={inactionActive}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-mono outline-none placeholder:opacity-30 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "oklch(0.08 0.016 290)",
                    border: `1.5px solid ${VIOLET_BORDER}`,
                    color: VIOLET_BRIGHT,
                  }}
                />
              </div>

              {/* M.Sim PIN */}
              <div>
                <label
                  htmlFor="msim-pin"
                  className="text-[9px] font-mono uppercase tracking-widest block mb-1"
                  style={{ color: "oklch(0.45 0.08 290)" }}
                >
                  M.Sim PIN
                </label>
                <input
                  id="msim-pin"
                  data-ocid="msim.transfer.pin_input"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                    setPinError("");
                  }}
                  disabled={inactionActive}
                  placeholder="••••"
                  className="w-full px-3 py-2.5 rounded-xl text-center text-xl font-mono tracking-[0.5em] outline-none placeholder:text-base placeholder:tracking-widest placeholder:opacity-30 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "oklch(0.08 0.016 290)",
                    border: pinError
                      ? "1.5px solid oklch(0.62 0.22 18)"
                      : `1.5px solid ${VIOLET_BORDER}`,
                    color: VIOLET_BRIGHT,
                  }}
                />
              </div>

              <AnimatePresence>
                {pinError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] font-mono"
                    style={{ color: "oklch(0.75 0.18 18)" }}
                  >
                    {pinError}
                  </motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {transferSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{
                      background: `${GREEN_SEAL}18`,
                      border: `1px solid ${GREEN_SEAL}44`,
                    }}
                  >
                    <CheckCircle2
                      style={{ color: GREEN_SEAL, width: 14, height: 14 }}
                    />
                    <span
                      className="text-[11px] font-mono"
                      style={{ color: GREEN_SEAL }}
                    >
                      Transfer logged to Strong Room ledger
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                data-ocid="msim.transfer.submit_button"
                type="button"
                onClick={handleTransfer}
                disabled={inactionActive || !transferAmount || pin.length < 4}
                className="w-full py-3 rounded-xl font-display font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.42 0.2 290) 0%, oklch(0.58 0.22 290) 100%)",
                  color: "oklch(0.97 0.01 290)",
                  boxShadow:
                    !inactionActive && transferAmount && pin.length === 4
                      ? `0 4px 20px ${VIOLET_GLOW}`
                      : "none",
                  border: "1px solid oklch(0.62 0.22 290 / 0.5)",
                }}
              >
                Initiate Transfer
              </button>
            </div>
          </motion.div>

          {/* ── Activity Log ────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${VIOLET_BORDER}` }}
          >
            {/* Legal document header */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                background: "oklch(0.16 0.032 290)",
                borderBottom: `1px solid ${VIOLET_BORDER}`,
              }}
            >
              <div>
                <p
                  className="text-[10px] font-mono uppercase tracking-widest font-bold"
                  style={{ color: VIOLET_ACCENT }}
                >
                  Sealed Audit Record
                </p>
                <p
                  className="text-[8px] font-mono"
                  style={{ color: "oklch(0.38 0.07 290)" }}
                >
                  Strong Room · SR-MOIRA-2626 · Tamper-evident log
                </p>
              </div>
              <div
                className="px-2 py-1 rounded-lg"
                style={{
                  background: `${GREEN_SEAL}15`,
                  border: `1px solid ${GREEN_SEAL}33`,
                }}
              >
                <span
                  className="text-[8px] font-mono font-bold uppercase tracking-widest"
                  style={{ color: GREEN_SEAL }}
                >
                  SEALED ✓
                </span>
              </div>
            </div>

            {/* Log entries */}
            <div style={{ background: "oklch(0.10 0.018 290)" }}>
              {log.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  initial={
                    idx === 0 && log.length > 4 ? { opacity: 0, y: -8 } : {}
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 py-3"
                  style={{
                    background:
                      idx % 2 === 0
                        ? "oklch(0.10 0.018 290)"
                        : "oklch(0.12 0.022 290)",
                    borderBottom:
                      idx < log.length - 1
                        ? "1px solid oklch(0.18 0.03 290)"
                        : "none",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[10px] font-mono font-bold truncate"
                        style={{ color: "oklch(0.72 0.12 290)" }}
                      >
                        {entry.description}
                      </p>
                      <p
                        className="text-[9px] font-mono mt-0.5"
                        style={{ color: "oklch(0.38 0.06 290)" }}
                      >
                        {entry.timestamp}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {entry.type !== "neutral" && (
                        <div
                          className="flex items-center gap-0.5 px-2 py-0.5 rounded-full"
                          style={{
                            background:
                              entry.type === "credit"
                                ? `${GREEN_SEAL}15`
                                : "oklch(0.62 0.22 290 / 0.1)",
                            border:
                              entry.type === "credit"
                                ? `1px solid ${GREEN_SEAL}33`
                                : `1px solid ${VIOLET_BORDER}`,
                          }}
                        >
                          {entry.type === "credit" ? (
                            <TrendingUp
                              style={{
                                color: GREEN_SEAL,
                                width: 8,
                                height: 8,
                              }}
                            />
                          ) : (
                            <TrendingDown
                              style={{
                                color: VIOLET_ACCENT,
                                width: 8,
                                height: 8,
                              }}
                            />
                          )}
                          <span
                            className="text-[9px] font-mono font-bold"
                            style={{
                              color:
                                entry.type === "credit"
                                  ? GREEN_SEAL
                                  : VIOLET_ACCENT,
                            }}
                          >
                            {entry.amount}
                          </span>
                        </div>
                      )}
                      {entry.type === "neutral" && (
                        <span
                          className="text-[9px] font-mono"
                          style={{ color: "oklch(0.38 0.06 290)" }}
                        >
                          —
                        </span>
                      )}
                      <span
                        className="text-[8px] font-mono font-bold"
                        style={{ color: GREEN_SEAL, opacity: 0.7 }}
                      >
                        ✓
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <p
            className="text-center text-[9px] font-mono py-2"
            style={{ color: "oklch(0.32 0.05 290)" }}
          >
            M.Sim Strong Room · Moira Labs · CC BY-NC-ND · P.S. Thimaia
          </p>
        </div>
      </motion.div>
    </>
  );
}
