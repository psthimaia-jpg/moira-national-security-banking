import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Delete,
  KeyRound,
  Lock,
  LockKeyhole,
  LockKeyholeOpen,
  OctagonX,
  Settings,
  Shield,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../../hooks/useActor";

// ── Constants ──────────────────────────────────────────────
const CORRECT_PIN = "262626";
const MAX_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 30;

type VaultStatus = "locked" | "unlocked";

interface SecurityLogEntry {
  id: string;
  timestamp: Date;
  eventType:
    | "Unlocked"
    | "Locked"
    | "Failed Attempt"
    | "Breach Alert"
    | "PIN Changed"
    | "Settings Updated"
    | "Escrow Released";
  status: "success" | "warning" | "error" | "info";
}

const PROTECTED_ASSETS = [
  {
    id: "savings",
    icon: Wallet,
    label: "Savings Account",
    masked: "****4521",
    value: "$18,200.00",
    type: "Savings",
    color: "oklch(0.82 0.14 200)",
  },
  {
    id: "portfolio",
    icon: TrendingUp,
    label: "Investment Portfolio",
    masked: "****7834",
    value: "$42,500.00",
    type: "Investments",
    color: "oklch(0.78 0.12 75)",
  },
  {
    id: "crypto",
    icon: Shield,
    label: "Crypto Wallet",
    masked: "****9912",
    value: "$3,847.50",
    type: "Crypto",
    color: "oklch(0.7 0.17 150)",
  },
  {
    id: "credit",
    icon: CreditCard,
    label: "Premium Credit Card",
    masked: "****2201",
    value: "Limit $25,000",
    type: "Credit",
    color: "oklch(0.65 0.22 15)",
  },
];

// ── 26.ai Badge ────────────────────────────────────────────
function TwentySixBadge({ size = "sm" }: { size?: "sm" | "lg" }) {
  const isLg = size === "lg";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-mono-code font-bold tracking-wider ${isLg ? "px-3.5 py-1.5 text-xs" : "px-2.5 py-1 text-[10px]"}`}
      style={{
        background:
          "linear-gradient(135deg, oklch(0.1 0.025 245), oklch(0.14 0.03 200))",
        border: "1px solid oklch(0.82 0.14 200 / 0.4)",
        color: "oklch(0.82 0.14 200)",
        boxShadow:
          "0 0 16px oklch(0.82 0.14 200 / 0.25), inset 0 1px 0 oklch(0.82 0.14 200 / 0.1)",
      }}
    >
      <div
        className="w-2 h-2 rounded-full animate-pulse-dot"
        style={{ background: "oklch(0.82 0.14 200)" }}
      />
      SECURED BY 26.AI
      <Zap className="w-2.5 h-2.5" style={{ color: "oklch(0.82 0.14 200)" }} />
    </motion.div>
  );
}

// ── PIN Pad ────────────────────────────────────────────────
interface PinPadProps {
  pin: string;
  onDigit: (d: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled: boolean;
  shake: boolean;
}

function PinPad({
  pin,
  onDigit,
  onDelete,
  onSubmit,
  disabled,
  shake,
}: PinPadProps) {
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* PIN dots */}
      <motion.div
        className="flex gap-4"
        animate={shake ? { x: [-6, 6, -6, 6, -4, 4, 0] } : {}}
        transition={{ duration: 0.45 }}
      >
        {["d0", "d1", "d2", "d3", "d4", "d5"].map((dotId, i) => (
          <motion.div
            key={dotId}
            animate={
              pin.length > i
                ? { scale: [1, 1.3, 1], opacity: [0.5, 1, 1] }
                : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 0.2 }}
            className="w-4 h-4 rounded-full border-2 transition-all duration-150"
            style={{
              borderColor:
                pin.length > i
                  ? "oklch(0.82 0.14 200)"
                  : "oklch(0.35 0.04 245)",
              background:
                pin.length > i
                  ? "oklch(0.82 0.14 200)"
                  : "oklch(0.12 0.02 245)",
              boxShadow:
                pin.length > i ? "0 0 10px oklch(0.82 0.14 200 / 0.6)" : "none",
            }}
          />
        ))}
      </motion.div>

      {/* Keypad grid */}
      <div className="grid grid-cols-3 gap-2.5 w-full max-w-[224px]">
        {digits.map((d, i) => {
          const btnKey = `pad-${i}-${d || "empty"}`;
          if (d === "") {
            return <div key={btnKey} />;
          }
          const isDelete = d === "⌫";
          return (
            <motion.button
              key={btnKey}
              type="button"
              disabled={disabled}
              whileTap={{ scale: 0.88, opacity: 0.8 }}
              whileHover={disabled ? {} : { scale: 1.04 }}
              onClick={() => {
                if (isDelete) onDelete();
                else onDigit(d);
              }}
              className="h-12 rounded-xl font-mono-code font-bold text-lg flex items-center justify-center transition-colors disabled:opacity-40 select-none"
              style={{
                background: isDelete
                  ? "oklch(0.17 0.03 245)"
                  : "linear-gradient(145deg, oklch(0.17 0.028 245), oklch(0.14 0.022 245))",
                border: isDelete
                  ? "1px solid oklch(0.28 0.04 245)"
                  : "1px solid oklch(0.28 0.04 245)",
                color: isDelete
                  ? "oklch(0.6 0.04 245)"
                  : "oklch(0.92 0.01 255)",
                boxShadow: "0 2px 4px oklch(0 0 0 / 0.3)",
              }}
            >
              {isDelete ? <Delete className="w-4 h-4" /> : d}
            </motion.button>
          );
        })}
      </div>

      {/* Submit */}
      <motion.button
        type="button"
        disabled={disabled || pin.length < 6}
        whileTap={{ scale: 0.97 }}
        whileHover={pin.length === 6 && !disabled ? { scale: 1.02 } : {}}
        onClick={onSubmit}
        className="w-full max-w-[224px] h-12 rounded-xl font-display font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-30"
        style={{
          background:
            pin.length === 6 && !disabled
              ? "linear-gradient(135deg, oklch(0.82 0.14 200), oklch(0.65 0.12 200))"
              : "oklch(0.17 0.025 245)",
          border:
            pin.length === 6 && !disabled
              ? "1px solid oklch(0.82 0.14 200 / 0.6)"
              : "1px solid oklch(0.28 0.04 245)",
          color:
            pin.length === 6 && !disabled
              ? "oklch(0.08 0.015 245)"
              : "oklch(0.45 0.04 255)",
          boxShadow:
            pin.length === 6 && !disabled
              ? "0 0 24px oklch(0.82 0.14 200 / 0.4), 0 4px 12px oklch(0 0 0 / 0.3)"
              : "none",
        }}
      >
        Verify Access
      </motion.button>
    </div>
  );
}

// ── Breach Alert Overlay ─────────────────────────────────────
interface BreachAlertProps {
  cooldownRemaining: number;
  isOpen: boolean;
}

function BreachAlertOverlay({ cooldownRemaining, isOpen }: BreachAlertProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "oklch(0.05 0.015 20 / 0.92)" }}
        >
          {/* Pulsing outer ring */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.3, 0.15, 0.3],
            }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            className="absolute w-80 h-80 rounded-full"
            style={{ border: "2px solid oklch(0.75 0.18 18)" }}
          />
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.2, 0.08, 0.2],
            }}
            transition={{
              duration: 1.5,
              delay: 0.3,
              repeat: Number.POSITIVE_INFINITY,
            }}
            className="absolute w-96 h-96 rounded-full"
            style={{ border: "1px solid oklch(0.75 0.18 18)" }}
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative z-10 w-72 mx-4 rounded-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, oklch(0.12 0.03 20), oklch(0.09 0.02 20))",
              border: "2px solid oklch(0.75 0.18 18 / 0.6)",
              boxShadow:
                "0 0 60px oklch(0.62 0.2 18 / 0.5), 0 24px 80px oklch(0 0 0 / 0.7)",
            }}
          >
            {/* Red scan line at top */}
            <div
              className="h-0.5 w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.75 0.18 18), transparent)",
              }}
            />

            <div className="p-6 text-center">
              {/* Icon */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 0 oklch(0.62 0.2 18 / 0.5)",
                    "0 0 0 16px oklch(0.62 0.2 18 / 0)",
                  ],
                }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{
                  background: "oklch(0.62 0.2 18 / 0.15)",
                  border: "2px solid oklch(0.75 0.18 18 / 0.5)",
                }}
              >
                <AlertTriangle
                  className="w-10 h-10"
                  style={{ color: "oklch(0.75 0.18 18)" }}
                />
              </motion.div>

              {/* Title */}
              <motion.p
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                className="font-display font-bold text-xl tracking-widest mb-1 uppercase"
                style={{ color: "oklch(0.75 0.18 18)" }}
              >
                ⚠ BREACH ALERT
              </motion.p>

              <p
                className="text-[10px] font-mono-code tracking-widest mb-4"
                style={{ color: "oklch(0.55 0.1 18)" }}
              >
                26.AI SECURITY PROTOCOL TRIGGERED
              </p>

              <p
                className="text-xs font-body leading-relaxed mb-5"
                style={{ color: "oklch(0.7 0.04 255)" }}
              >
                Maximum failed attempts reached. The vault has been secured and
                access is temporarily suspended.
              </p>

              {/* Countdown */}
              <div
                className="rounded-xl py-4 mb-4"
                style={{
                  background: "oklch(0.62 0.2 18 / 0.08)",
                  border: "1px solid oklch(0.62 0.2 18 / 0.3)",
                }}
              >
                <p
                  className="text-[9px] font-mono-code tracking-widest mb-1"
                  style={{ color: "oklch(0.55 0.08 18)" }}
                >
                  COOLDOWN TIMER
                </p>
                <motion.p
                  key={cooldownRemaining}
                  initial={{ scale: 1.3, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-mono-code font-bold tabular-nums"
                  style={{ color: "oklch(0.75 0.18 18)" }}
                >
                  {String(cooldownRemaining).padStart(2, "0")}
                </motion.p>
                <p
                  className="text-[9px] font-mono-code mt-1"
                  style={{ color: "oklch(0.45 0.05 18)" }}
                >
                  seconds remaining
                </p>
              </div>

              <p
                className="text-[10px] font-body"
                style={{ color: "oklch(0.45 0.04 255)" }}
              >
                Access resumes automatically after cooldown
              </p>
            </div>

            {/* Bottom scan line */}
            <div
              className="h-0.5 w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.75 0.18 18 / 0.5), transparent)",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main VaultPage ─────────────────────────────────────────
interface VaultPageProps {
  vaultStatus: VaultStatus;
  onVaultStatusChange: (status: VaultStatus) => void;
  inactionActive?: boolean;
}

type EscrowState = "pending" | "releasing" | "released";

export default function VaultPage({
  vaultStatus,
  onVaultStatusChange,
  inactionActive = false,
}: VaultPageProps) {
  const { actor } = useActor();
  const [pin, setPin] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [shake, setShake] = useState(false);
  const [isBreachAlert, setIsBreachAlert] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [securityLog, setSecurityLog] = useState<SecurityLogEntry[]>([
    {
      id: "init",
      timestamp: new Date(Date.now() - 5 * 60000),
      eventType: "Locked",
      status: "info",
    },
  ]);

  // Escrow state
  const [escrowState, setEscrowState] = useState<EscrowState>("pending");
  const [escrowProgress, setEscrowProgress] = useState(0);

  // Vault settings
  const [autoLock, setAutoLock] = useState(true);
  const [autoLockDuration, setAutoLockDuration] = useState("15");
  const [showChangePinForm, setShowChangePinForm] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addLogEntry = useCallback(
    (
      eventType: SecurityLogEntry["eventType"],
      status: SecurityLogEntry["status"],
    ) => {
      const entry: SecurityLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date(),
        eventType,
        status,
      };
      setSecurityLog((prev) => [entry, ...prev].slice(0, 20));
    },
    [],
  );

  // Cooldown timer
  useEffect(() => {
    if (cooldownRemaining > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownTimerRef.current!);
            setIsBreachAlert(false);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, [cooldownRemaining]);

  // Auto-lock timer
  // biome-ignore lint/correctness/useExhaustiveDependencies: addLogEntry is stable
  useEffect(() => {
    if (
      vaultStatus === "unlocked" &&
      autoLock &&
      autoLockDuration !== "never"
    ) {
      const ms = Number.parseInt(autoLockDuration) * 60 * 1000;
      autoLockTimerRef.current = setTimeout(() => {
        onVaultStatusChange("locked");
        addLogEntry("Locked", "info");
        toast.info("Vault auto-locked");
      }, ms);
    }
    return () => {
      if (autoLockTimerRef.current) clearTimeout(autoLockTimerRef.current);
    };
  }, [vaultStatus, autoLock, autoLockDuration, onVaultStatusChange]);

  const handleDigit = (d: string) => {
    if (pin.length >= 6) return;
    setPin((prev) => prev + d);
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = useCallback(() => {
    if (pin.length !== 6 || cooldownRemaining > 0) return;

    if (pin === CORRECT_PIN) {
      setPin("");
      setFailedAttempts(0);
      onVaultStatusChange("unlocked");
      addLogEntry("Unlocked", "success");
      toast.success("Vault unlocked — welcome back");
    } else {
      const newAttempts = failedAttempts + 1;
      setPin("");
      setShake(true);
      setTimeout(() => setShake(false), 600);
      addLogEntry("Failed Attempt", "warning");

      if (newAttempts >= MAX_ATTEMPTS) {
        setFailedAttempts(0);
        setIsBreachAlert(true);
        setCooldownRemaining(COOLDOWN_SECONDS);
        addLogEntry("Breach Alert", "error");
        toast.error("Breach alert triggered! Vault locked for 30 seconds.");
      } else {
        setFailedAttempts(newAttempts);
        toast.error(
          `Wrong PIN — ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? "" : "s"} remaining`,
        );
      }
    }
  }, [
    pin,
    cooldownRemaining,
    failedAttempts,
    onVaultStatusChange,
    addLogEntry,
  ]);

  const handleLockVault = () => {
    onVaultStatusChange("locked");
    addLogEntry("Locked", "info");
    setPin("");
    toast.info("Vault locked");
  };

  const handleEscrowConfirm = useCallback(() => {
    setEscrowState("releasing");
    setEscrowProgress(0);

    // Animate progress 0→100 over 2 seconds
    const start = Date.now();
    const duration = 2000;
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setEscrowProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        setEscrowState("released");
        addLogEntry("Escrow Released", "success");
        toast.success("Escrow released — funds transferred successfully");
        if (actor) {
          actor
            .logHealthEvent(
              "Fraud-Proof Escrow",
              "RELEASED",
              "Satisfaction handshake confirmed — funds released",
            )
            .catch(() => {});
        }
      }
    };
    requestAnimationFrame(tick);
  }, [addLogEntry, actor]);

  const handleChangePin = () => {
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      toast.error("PIN must be exactly 6 digits");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }
    setNewPin("");
    setConfirmPin("");
    setShowChangePinForm(false);
    addLogEntry("PIN Changed", "success");
    toast.success("PIN updated successfully");
  };

  const isLocked = vaultStatus === "locked";
  const isPinDisabled = cooldownRemaining > 0;

  const logEventConfig: Record<
    SecurityLogEntry["eventType"],
    { color: string; icon: typeof CheckCircle2 }
  > = {
    Unlocked: { color: "oklch(0.7 0.17 150)", icon: LockKeyholeOpen },
    Locked: { color: "oklch(0.82 0.14 200)", icon: LockKeyhole },
    "Failed Attempt": { color: "oklch(0.78 0.12 75)", icon: AlertTriangle },
    "Breach Alert": { color: "oklch(0.62 0.2 18)", icon: AlertTriangle },
    "PIN Changed": { color: "oklch(0.82 0.14 200)", icon: KeyRound },
    "Settings Updated": { color: "oklch(0.6 0.08 255)", icon: Settings },
    "Escrow Released": { color: "oklch(0.7 0.17 150)", icon: ShieldCheck },
  };

  function formatLogTime(d: Date): string {
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="pb-6 relative">
      {/* ── Inaction Safety Banner ──────────────────────── */}
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
          Inaction Safety engaged — vault entry locked
        </div>
      )}
      {/* ── Breach Alert Full-screen Overlay ──────────────── */}
      <BreachAlertOverlay
        cooldownRemaining={cooldownRemaining}
        isOpen={isBreachAlert && cooldownRemaining > 0}
      />

      {/* ── Vault Header ────────────────────────────────── */}
      <div
        className="relative overflow-hidden px-3 pt-3 pb-4"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.1 0.025 245) 0%, oklch(0.12 0.018 255) 100%)",
          borderBottom: "1px solid oklch(0.22 0.03 245)",
        }}
      >
        {/* Scan line effect */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ opacity: 0.06 }}
        >
          <div
            className="absolute w-full h-px animate-vault-scan"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, oklch(0.82 0.14 200) 50%, transparent 100%)",
              top: 0,
            }}
          />
        </div>

        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isLocked
              ? "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.62 0.2 18 / 0.07), transparent)"
              : "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.82 0.14 200 / 0.07), transparent)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <TwentySixBadge />
            <Badge
              className="font-mono-code text-[10px] font-bold px-2 py-0.5"
              style={
                isLocked
                  ? {
                      background: "oklch(0.62 0.2 18 / 0.15)",
                      border: "1px solid oklch(0.62 0.2 18 / 0.4)",
                      color: "oklch(0.75 0.18 18)",
                    }
                  : {
                      background: "oklch(0.7 0.17 150 / 0.15)",
                      border: "1px solid oklch(0.7 0.17 150 / 0.4)",
                      color: "oklch(0.8 0.15 150)",
                    }
              }
            >
              {isLocked ? "● LOCKED" : "● UNLOCKED"}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              animate={
                isLocked ? {} : { rotate: [0, -10, 0], scale: [1, 1.05, 1] }
              }
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: isLocked
                  ? "oklch(0.62 0.2 18 / 0.15)"
                  : "oklch(0.82 0.14 200 / 0.15)",
                border: isLocked
                  ? "1px solid oklch(0.62 0.2 18 / 0.3)"
                  : "1px solid oklch(0.82 0.14 200 / 0.3)",
              }}
            >
              {isLocked ? (
                <LockKeyhole
                  className="w-5 h-5"
                  style={{ color: "oklch(0.75 0.18 18)" }}
                />
              ) : (
                <LockKeyholeOpen
                  className="w-5 h-5"
                  style={{ color: "oklch(0.82 0.14 200)" }}
                />
              )}
            </motion.div>
            <div>
              <h1 className="font-display font-bold text-base text-foreground tracking-tight">
                Moira Vault
              </h1>
              <p className="text-[10px] font-body text-muted-foreground">
                {isLocked
                  ? "Enter your 6-digit PIN to access"
                  : "Full vault access granted"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── LOCKED VIEW ─────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {isLocked ? (
          <motion.div
            key="locked"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="px-3 pt-4"
          >
            {/* Vault door icon */}
            <div className="flex flex-col items-center mb-6">
              <motion.div
                className={`relative w-24 h-24 rounded-3xl flex items-center justify-center mb-3 ${
                  isPinDisabled ? "vault-glow-red" : "vault-glow-cyan"
                }`}
                style={{
                  background:
                    "linear-gradient(145deg, oklch(0.16 0.03 245), oklch(0.12 0.022 245))",
                  border: isPinDisabled
                    ? "2px solid oklch(0.62 0.2 18 / 0.5)"
                    : "2px solid oklch(0.82 0.14 200 / 0.35)",
                }}
              >
                {/* Scan line animation */}
                {!isPinDisabled && (
                  <div
                    className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"
                    style={{ opacity: 0.15 }}
                  >
                    <div
                      className="absolute w-full h-0.5 animate-vault-scan"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, oklch(0.82 0.14 200), transparent)",
                      }}
                    />
                  </div>
                )}
                {isPinDisabled ? (
                  <AlertTriangle
                    className="w-12 h-12 animate-breach-pulse"
                    style={{ color: "oklch(0.75 0.18 18)" }}
                  />
                ) : (
                  <LockKeyhole
                    className="w-12 h-12"
                    style={{ color: "oklch(0.82 0.14 200)" }}
                  />
                )}
              </motion.div>

              {isPinDisabled ? (
                <div className="text-center">
                  <p
                    className="font-display font-bold text-sm mb-1"
                    style={{ color: "oklch(0.75 0.18 18)" }}
                  >
                    BREACH ALERT
                  </p>
                  <p className="text-xs font-body text-muted-foreground mb-2">
                    Too many failed attempts
                  </p>
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono-code text-sm font-bold"
                    style={{
                      background: "oklch(0.62 0.2 18 / 0.15)",
                      border: "1px solid oklch(0.62 0.2 18 / 0.4)",
                      color: "oklch(0.75 0.18 18)",
                    }}
                  >
                    <span className="text-[10px] font-body font-normal text-muted-foreground">
                      COOLDOWN
                    </span>
                    <motion.span
                      key={cooldownRemaining}
                      initial={{ scale: 1.3, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-xl tabular-nums"
                    >
                      {String(cooldownRemaining).padStart(2, "0")}s
                    </motion.span>
                  </div>
                </div>
              ) : failedAttempts > 0 ? (
                <div className="text-center">
                  <p
                    className="font-body text-xs font-medium"
                    style={{ color: "oklch(0.78 0.12 75)" }}
                  >
                    ⚠ Wrong PIN — {MAX_ATTEMPTS - failedAttempts} attempt
                    {MAX_ATTEMPTS - failedAttempts === 1 ? "" : "s"} remaining
                  </p>
                </div>
              ) : (
                <p className="text-xs font-body text-muted-foreground text-center">
                  Enter your 6-digit PIN to unlock the vault
                </p>
              )}
            </div>

            {/* PIN Pad */}
            <PinPad
              pin={pin}
              onDigit={handleDigit}
              onDelete={handleDelete}
              onSubmit={handleSubmit}
              disabled={isPinDisabled || inactionActive}
              shake={shake}
            />

            {/* Hint */}
            <p
              className="text-center text-[9px] font-mono-code mt-4"
              style={{ color: "oklch(0.4 0.03 255)" }}
            >
              Default PIN: 262626
            </p>
          </motion.div>
        ) : (
          /* ── UNLOCKED VIEW ─────────────────────────────── */
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="px-3 pt-4 space-y-4"
          >
            {/* Unlock success + lock button */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex items-center justify-between p-3 rounded-xl"
              style={{
                background: "oklch(0.82 0.14 200 / 0.08)",
                border: "1px solid oklch(0.82 0.14 200 / 0.25)",
              }}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className="w-5 h-5"
                  style={{ color: "oklch(0.82 0.14 200)" }}
                />
                <div>
                  <p
                    className="text-xs font-display font-semibold"
                    style={{ color: "oklch(0.82 0.14 200)" }}
                  >
                    Vault Access Granted
                  </p>
                  <p className="text-[10px] font-body text-muted-foreground">
                    Protected assets revealed
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLockVault}
                size="sm"
                className="h-7 px-3 text-[10px] font-display font-bold rounded-lg"
                style={{
                  background: "oklch(0.62 0.2 18 / 0.2)",
                  border: "1px solid oklch(0.62 0.2 18 / 0.5)",
                  color: "oklch(0.85 0.14 18)",
                }}
              >
                <LockKeyhole className="w-3 h-3 mr-1" />
                Lock Vault
              </Button>
            </motion.div>

            {/* Protected Assets */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield
                  className="w-3.5 h-3.5"
                  style={{ color: "oklch(0.82 0.14 200)" }}
                />
                <h2
                  className="text-xs font-display font-semibold uppercase tracking-widest"
                  style={{ color: "oklch(0.82 0.14 200)" }}
                >
                  Protected Assets
                </h2>
              </div>

              <div className="space-y-2">
                {PROTECTED_ASSETS.map((asset, i) => {
                  const Icon = asset.icon;
                  return (
                    <motion.div
                      key={asset.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{
                        background: "oklch(0.14 0.022 245)",
                        border: "1px solid oklch(0.22 0.03 245)",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `${asset.color.replace(")", " / 0.12)")}`,
                          border: `1px solid ${asset.color.replace(")", " / 0.25)")}`,
                        }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{ color: asset.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-body font-medium text-foreground truncate">
                          {asset.label}
                        </p>
                        <p
                          className="text-[10px] font-mono-code"
                          style={{ color: "oklch(0.55 0.04 255)" }}
                        >
                          {asset.masked} · {asset.type}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className="text-xs font-mono-code font-bold"
                          style={{ color: asset.color }}
                        >
                          {asset.value}
                        </p>
                        <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto mt-0.5" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ── Fraud-Proof Escrow ───────────────────────── */}
            <div data-ocid="escrow.panel">
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(145deg, oklch(0.12 0.025 245), oklch(0.14 0.022 245))",
                  border:
                    escrowState === "released"
                      ? "1px solid oklch(0.7 0.17 150 / 0.4)"
                      : escrowState === "releasing"
                        ? "1px solid oklch(0.6 0.18 200 / 0.45)"
                        : "1px solid oklch(0.78 0.12 75 / 0.35)",
                  boxShadow:
                    escrowState === "released"
                      ? "0 0 16px oklch(0.7 0.17 150 / 0.12)"
                      : "none",
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-3 py-2.5 border-b"
                  style={{ borderColor: "oklch(0.22 0.03 245)" }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{
                        background:
                          escrowState === "released"
                            ? "oklch(0.7 0.17 150 / 0.15)"
                            : "oklch(0.78 0.12 75 / 0.12)",
                        border:
                          escrowState === "released"
                            ? "1px solid oklch(0.7 0.17 150 / 0.3)"
                            : "1px solid oklch(0.78 0.12 75 / 0.25)",
                      }}
                    >
                      <Lock
                        className="w-3.5 h-3.5"
                        style={{
                          color:
                            escrowState === "released"
                              ? "oklch(0.7 0.17 150)"
                              : "oklch(0.78 0.12 75)",
                        }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-xs font-display font-semibold"
                        style={{
                          color:
                            escrowState === "released"
                              ? "oklch(0.8 0.15 150)"
                              : "oklch(0.9 0.01 255)",
                        }}
                      >
                        Fraud-Proof Escrow
                      </p>
                      <p
                        className="text-[9px] font-mono-code"
                        style={{ color: "oklch(0.5 0.04 255)" }}
                      >
                        Ring-fenced on ICP blockchain
                      </p>
                    </div>
                  </div>

                  {/* 26.ai ON-CHAIN badge */}
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-full"
                    style={{
                      background: "oklch(0.1 0.025 245)",
                      border: "1px solid oklch(0.82 0.14 200 / 0.35)",
                    }}
                  >
                    <Zap
                      className="w-2 h-2"
                      style={{ color: "oklch(0.82 0.14 200)" }}
                    />
                    <span
                      className="text-[7px] font-mono-code font-bold tracking-widest"
                      style={{ color: "oklch(0.82 0.14 200)" }}
                    >
                      26.ai ON-CHAIN
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="px-3 py-3 space-y-3">
                  {/* Amount + status */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-[9px] font-mono-code tracking-widest uppercase mb-0.5"
                        style={{ color: "oklch(0.5 0.04 255)" }}
                      >
                        Pending Delivery Verification
                      </p>
                      <p
                        className="text-lg font-mono-code font-bold tabular-nums"
                        style={{
                          color:
                            escrowState === "released"
                              ? "oklch(0.7 0.17 150)"
                              : "oklch(0.86 0.1 255)",
                        }}
                      >
                        $8,500.00
                      </p>
                    </div>

                    {/* Status badge */}
                    {escrowState === "pending" && (
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{
                          background: "oklch(0.78 0.12 75 / 0.12)",
                          border: "1px solid oklch(0.78 0.12 75 / 0.35)",
                        }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: "oklch(0.78 0.12 75)" }}
                        />
                        <span
                          className="text-[9px] font-mono-code font-bold tracking-widest"
                          style={{ color: "oklch(0.78 0.12 75)" }}
                        >
                          PENDING
                        </span>
                      </div>
                    )}
                    {escrowState === "releasing" && (
                      <motion.div
                        animate={{ opacity: [1, 0.6, 1] }}
                        transition={{
                          duration: 0.8,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{
                          background: "oklch(0.6 0.18 200 / 0.12)",
                          border: "1px solid oklch(0.6 0.18 200 / 0.35)",
                        }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
                          style={{ background: "oklch(0.82 0.14 200)" }}
                        />
                        <span
                          className="text-[9px] font-mono-code font-bold tracking-widest"
                          style={{ color: "oklch(0.82 0.14 200)" }}
                        >
                          RELEASING
                        </span>
                      </motion.div>
                    )}
                    {escrowState === "released" && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{
                          background: "oklch(0.7 0.17 150 / 0.15)",
                          border: "1px solid oklch(0.7 0.17 150 / 0.45)",
                        }}
                      >
                        <CheckCircle2
                          className="w-2.5 h-2.5"
                          style={{ color: "oklch(0.7 0.17 150)" }}
                        />
                        <span
                          className="text-[9px] font-mono-code font-bold tracking-widest"
                          style={{ color: "oklch(0.7 0.17 150)" }}
                        >
                          RELEASED
                        </span>
                      </motion.div>
                    )}
                  </div>

                  {/* Description */}
                  <p
                    className="text-[10px] font-body leading-relaxed"
                    style={{ color: "oklch(0.6 0.04 255)" }}
                  >
                    Funds are ring-fenced until 100% Proof of Delivery is
                    verified via satisfaction handshake.
                  </p>

                  {/* Releasing progress bar */}
                  {escrowState === "releasing" && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[9px] font-mono-code"
                          style={{ color: "oklch(0.82 0.14 200)" }}
                        >
                          Processing release…
                        </span>
                        <span
                          className="text-[9px] font-mono-code tabular-nums"
                          style={{ color: "oklch(0.82 0.14 200)" }}
                        >
                          {escrowProgress}%
                        </span>
                      </div>
                      <Progress
                        value={escrowProgress}
                        className="h-1.5 rounded-full"
                        style={
                          {
                            background: "oklch(0.18 0.025 245)",
                            "--progress-fill": "oklch(0.82 0.14 200)",
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  )}

                  {/* Released state */}
                  {escrowState === "released" && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-2.5 rounded-lg"
                      style={{
                        background: "oklch(0.7 0.17 150 / 0.08)",
                        border: "1px solid oklch(0.7 0.17 150 / 0.25)",
                      }}
                    >
                      <CheckCircle2
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: "oklch(0.7 0.17 150)" }}
                      />
                      <div>
                        <p
                          className="text-[11px] font-display font-bold tracking-widest"
                          style={{ color: "oklch(0.7 0.17 150)" }}
                        >
                          DELIVERED &amp; VERIFIED
                        </p>
                        <p
                          className="text-[9px] font-body"
                          style={{ color: "oklch(0.55 0.1 150)" }}
                        >
                          Satisfaction handshake confirmed
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Satisfaction Handshake button */}
                  {escrowState !== "released" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          data-ocid="escrow.handshake_button"
                          disabled={
                            inactionActive || escrowState === "releasing"
                          }
                          size="sm"
                          className="w-full h-9 text-xs font-display font-bold rounded-lg transition-all disabled:opacity-40"
                          style={{
                            background:
                              inactionActive || escrowState === "releasing"
                                ? "oklch(0.17 0.025 245)"
                                : "linear-gradient(135deg, oklch(0.78 0.12 75), oklch(0.65 0.1 75))",
                            border:
                              inactionActive || escrowState === "releasing"
                                ? "1px solid oklch(0.28 0.04 245)"
                                : "1px solid oklch(0.78 0.12 75 / 0.6)",
                            color:
                              inactionActive || escrowState === "releasing"
                                ? "oklch(0.45 0.04 255)"
                                : "oklch(0.1 0.018 255)",
                            boxShadow:
                              inactionActive || escrowState === "releasing"
                                ? "none"
                                : "0 0 16px oklch(0.78 0.12 75 / 0.3)",
                          }}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                          Satisfaction Handshake
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent
                        style={{
                          background:
                            "linear-gradient(145deg, oklch(0.12 0.025 245), oklch(0.1 0.02 245))",
                          border: "1px solid oklch(0.3 0.04 245)",
                          color: "oklch(0.95 0.01 255)",
                        }}
                      >
                        <AlertDialogHeader>
                          <AlertDialogTitle
                            className="font-display font-bold"
                            style={{ color: "oklch(0.9 0.01 255)" }}
                          >
                            Confirm Proof of Delivery
                          </AlertDialogTitle>
                          <AlertDialogDescription
                            className="font-body text-sm leading-relaxed"
                            style={{ color: "oklch(0.65 0.04 255)" }}
                          >
                            By confirming, you certify that delivery has been
                            completed and the recipient has verified
                            satisfaction. This will release{" "}
                            <span
                              className="font-mono-code font-bold"
                              style={{ color: "oklch(0.78 0.12 75)" }}
                            >
                              $8,500.00
                            </span>{" "}
                            from escrow.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            data-ocid="escrow.cancel_button"
                            className="font-display text-sm"
                            style={{
                              background: "oklch(0.18 0.025 245)",
                              border: "1px solid oklch(0.3 0.04 245)",
                              color: "oklch(0.75 0.04 255)",
                            }}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            data-ocid="escrow.confirm_button"
                            onClick={handleEscrowConfirm}
                            className="font-display font-bold text-sm"
                            style={{
                              background:
                                "linear-gradient(135deg, oklch(0.78 0.12 75), oklch(0.62 0.1 75))",
                              border: "none",
                              color: "oklch(0.1 0.018 255)",
                              boxShadow: "0 0 16px oklch(0.78 0.12 75 / 0.3)",
                            }}
                          >
                            Confirm &amp; Release
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {/* Footer text */}
                  <p
                    className="text-[8px] font-mono-code text-center tracking-widest"
                    style={{ color: "oklch(0.4 0.03 255)" }}
                  >
                    Ring-fenced on ICP blockchain · 26.ai Escrow Protocol
                  </p>
                </div>
              </div>
            </div>

            {/* Security Log */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <KeyRound
                  className="w-3.5 h-3.5"
                  style={{ color: "oklch(0.82 0.14 200)" }}
                />
                <h2
                  className="text-xs font-display font-semibold uppercase tracking-widest"
                  style={{ color: "oklch(0.82 0.14 200)" }}
                >
                  Security Log
                </h2>
              </div>

              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: "oklch(0.12 0.02 245)",
                  border: "1px solid oklch(0.22 0.03 245)",
                }}
              >
                <AnimatePresence initial={false}>
                  {securityLog.slice(0, 8).map((entry, i) => {
                    const cfg = logEventConfig[entry.eventType];
                    const EntryIcon = cfg.icon;
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-2.5 px-3 py-2 border-b last:border-0"
                        style={{ borderColor: "oklch(0.18 0.025 245)" }}
                      >
                        <EntryIcon
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color: cfg.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <span
                            className="text-[10px] font-display font-semibold"
                            style={{ color: cfg.color }}
                          >
                            {entry.eventType}
                          </span>
                        </div>
                        <span
                          className="text-[9px] font-mono-code flex-shrink-0"
                          style={{ color: "oklch(0.45 0.03 255)" }}
                        >
                          {formatLogTime(entry.timestamp)}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Vault Settings */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Settings
                  className="w-3.5 h-3.5"
                  style={{ color: "oklch(0.82 0.14 200)" }}
                />
                <h2
                  className="text-xs font-display font-semibold uppercase tracking-widest"
                  style={{ color: "oklch(0.82 0.14 200)" }}
                >
                  Vault Settings
                </h2>
              </div>

              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: "oklch(0.14 0.022 245)",
                  border: "1px solid oklch(0.22 0.03 245)",
                }}
              >
                {/* Auto-lock toggle */}
                <div
                  className="flex items-center justify-between px-3 py-3 border-b"
                  style={{ borderColor: "oklch(0.2 0.028 245)" }}
                >
                  <div>
                    <p className="text-xs font-body font-medium text-foreground">
                      Auto-Lock
                    </p>
                    <p className="text-[10px] font-body text-muted-foreground">
                      Lock vault automatically
                    </p>
                  </div>
                  <Switch
                    checked={autoLock}
                    onCheckedChange={(v) => {
                      setAutoLock(v);
                      addLogEntry("Settings Updated", "info");
                    }}
                    className="data-[state=checked]:bg-vault-cyan"
                  />
                </div>

                {/* Auto-lock duration */}
                <div
                  className="flex items-center justify-between px-3 py-3 border-b"
                  style={{ borderColor: "oklch(0.2 0.028 245)" }}
                >
                  <div>
                    <p
                      className={`text-xs font-body font-medium ${autoLock ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      Lock After
                    </p>
                    <p className="text-[10px] font-body text-muted-foreground">
                      Inactivity timeout
                    </p>
                  </div>
                  <Select
                    value={autoLockDuration}
                    disabled={!autoLock}
                    onValueChange={(v) => {
                      setAutoLockDuration(v);
                      addLogEntry("Settings Updated", "info");
                    }}
                  >
                    <SelectTrigger
                      className="h-7 w-24 text-[10px] font-mono-code rounded-lg"
                      style={{
                        background: "oklch(0.18 0.025 245)",
                        border: "1px solid oklch(0.28 0.04 245)",
                        color: autoLock
                          ? "oklch(0.82 0.14 200)"
                          : "oklch(0.4 0.03 255)",
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        background: "oklch(0.18 0.025 245)",
                        border: "1px solid oklch(0.3 0.04 245)",
                      }}
                    >
                      {[
                        { value: "5", label: "5 min" },
                        { value: "15", label: "15 min" },
                        { value: "30", label: "30 min" },
                        { value: "never", label: "Never" },
                      ].map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="text-xs font-mono-code"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Change PIN */}
                <div className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => setShowChangePinForm((v) => !v)}
                    className="flex items-center justify-between w-full"
                  >
                    <div>
                      <p className="text-xs font-body font-medium text-foreground">
                        Change PIN
                      </p>
                      <p className="text-[10px] font-body text-muted-foreground">
                        Update your vault PIN
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: showChangePinForm ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight
                        className="w-4 h-4"
                        style={{ color: "oklch(0.82 0.14 200)" }}
                      />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {showChangePinForm && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 space-y-2.5">
                          <div>
                            <Label className="text-[10px] font-body text-muted-foreground mb-1 block">
                              New PIN (6 digits)
                            </Label>
                            <Input
                              type="password"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="••••••"
                              value={newPin}
                              onChange={(e) =>
                                setNewPin(
                                  e.target.value.replace(/\D/g, "").slice(0, 6),
                                )
                              }
                              className="h-9 text-sm font-mono-code rounded-lg"
                              style={{
                                background: "oklch(0.18 0.025 245)",
                                borderColor: "oklch(0.28 0.04 245)",
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] font-body text-muted-foreground mb-1 block">
                              Confirm PIN
                            </Label>
                            <Input
                              type="password"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="••••••"
                              value={confirmPin}
                              onChange={(e) =>
                                setConfirmPin(
                                  e.target.value.replace(/\D/g, "").slice(0, 6),
                                )
                              }
                              className="h-9 text-sm font-mono-code rounded-lg"
                              style={{
                                background: "oklch(0.18 0.025 245)",
                                borderColor: "oklch(0.28 0.04 245)",
                              }}
                            />
                          </div>
                          <Button
                            onClick={handleChangePin}
                            size="sm"
                            className="w-full h-9 text-xs font-display font-bold rounded-lg"
                            style={{
                              background:
                                "linear-gradient(135deg, oklch(0.82 0.14 200), oklch(0.65 0.12 200))",
                              color: "oklch(0.08 0.015 245)",
                              border: "none",
                            }}
                          >
                            Update PIN
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pb-2">
              <p className="text-[9px] font-mono-code text-muted-foreground tracking-widest">
                VAULT PROTECTED BY 26.AI SECURITY PROTOCOL v2.6
              </p>
            </div>

            {/* Sovereign Licensing Footer */}
            <div
              className="text-center py-3 mt-1 border-t"
              style={{ borderColor: "oklch(0.22 0.025 255)" }}
            >
              <p
                className="text-[9px] font-mono-code"
                style={{ color: "oklch(0.4 0.04 255)" }}
              >
                © P.S. Thimaia · CC BY-NC-ND · MOIRA SmartBank AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
