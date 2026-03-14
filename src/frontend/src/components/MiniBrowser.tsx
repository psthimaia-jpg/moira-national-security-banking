import {
  BookOpen,
  BrainCircuit,
  Building2,
  ChevronLeft,
  Cloud,
  CreditCard,
  Eye,
  EyeOff,
  Flag,
  Layers,
  LayoutDashboard,
  List,
  Lock,
  LockKeyhole,
  LockKeyholeOpen,
  MessageCircle,
  OctagonX,
  Printer,
  Radio,
  RefreshCw,
  Shield,
  ShieldCheck,
  Wifi,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDigitalSmile } from "../hooks/useDigitalSmile";
import BioSovereignBar from "./BioSovereignBar";
import DemoTour from "./DemoTour";
import DeviceTrustBar from "./DeviceTrustBar";
import DigitalSmileBar from "./DigitalSmileBar";
import PrintableNotesModal from "./PrintableNotesModal";
import SovereignOverlay from "./SovereignOverlay";
import BackofficePage from "./pages/BackofficePage";
import ChatPage from "./pages/ChatPage";
import CloudPage from "./pages/CloudPage";
import DashboardPage from "./pages/DashboardPage";
import GOIPage from "./pages/GOIPage";
import LibraryPage from "./pages/LibraryPage";
import MSimStrongRoomPage from "./pages/MSimStrongRoomPage";
import MoiraBrainPage from "./pages/MoiraBrainPage";
import SensorsPage from "./pages/SensorsPage";
import SixGPage from "./pages/SixGPage";
import TransactionsPage from "./pages/TransactionsPage";
import VaultPage from "./pages/VaultPage";

type Tab =
  | "dashboard"
  | "transactions"
  | "chat"
  | "sensors"
  | "vault"
  | "cloud"
  | "brain"
  | "backoffice"
  | "library"
  | "msim"
  | "sixg"
  | "goi";

type VaultStatus = "locked" | "unlocked";
type ESimTrust = "IGNITED" | "RESTRICTED";

const TABS: {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "transactions", label: "Txns", icon: List },
  { id: "chat", label: "Moira AI", icon: MessageCircle },
  { id: "sensors", label: "Sensors", icon: Wifi },
  { id: "vault", label: "Vault", icon: Shield },
  { id: "cloud", label: "Cloud", icon: Cloud },
  { id: "brain", label: "Brain", icon: BrainCircuit },
  { id: "backoffice", label: "Admin", icon: Building2 },
  { id: "library", label: "Library", icon: BookOpen },
  { id: "msim", label: "M.Sim", icon: CreditCard },
  { id: "sixg", label: "6G", icon: Radio },
  { id: "goi", label: "GOI", icon: Flag },
];

const TAB_URLS: Record<Tab, string> = {
  dashboard: "moira.nwos.ai/dashboard",
  transactions: "moira.nwos.ai/transactions",
  chat: "moira.nwos.ai/ai-assistant",
  sensors: "moira.nwos.ai/sensors",
  vault: "moira.nwos.ai/vault",
  cloud: "moira.nwos.ai/cloud",
  brain: "moira.nwos.ai/brain",
  backoffice: "moira.nwos.ai/backoffice",
  library: "moira.nwos.ai/library",
  msim: "moira.nwos.ai/msim-strongroom",
  sixg: "moira.nwos.ai/6g-network",
  goi: "moira.nwos.ai/goi-command",
};

// 262626 Self-Healing Audit runs every 60s
function useSelfHealingAudit() {
  const [score, setScore] = useState(98);
  const [lastAudit, setLastAudit] = useState(new Date().toLocaleTimeString());
  const [certified, setCertified] = useState(true);

  useEffect(() => {
    const run = () => {
      const s = 95 + Math.floor(Math.random() * 6); // 95-100
      setScore(s);
      setCertified(s >= 95);
      setLastAudit(new Date().toLocaleTimeString());
    };
    run();
    const t = setInterval(run, 60000);
    return () => clearInterval(t);
  }, []);

  return { score, lastAudit, certified };
}

export default function MiniBrowser() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [history, setHistory] = useState<Tab[]>(["dashboard"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [vaultStatus, setVaultStatus] = useState<VaultStatus>("locked");
  const [bankModeActive, setBankModeActive] = useState(true);
  const [inactionActive, setInactionActive] = useState(false);
  const [bioStatus, setBioStatus] = useState<
    "NORMAL" | "ELEVATED" | "DISTRESS"
  >("NORMAL");
  const [eSimTrust, setESimTrust] = useState<ESimTrust>("IGNITED");
  const [sovereignViewActive, setSovereignViewActive] = useState(false);
  const [printableNoteOpen, setPrintableNoteOpen] = useState(false);
  const [demoTourOpen, setDemoTourOpen] = useState(false);

  const { score: auditScore, lastAudit, certified } = useSelfHealingAudit();

  const toggleESimTrust = () => {
    setESimTrust((prev) => (prev === "IGNITED" ? "RESTRICTED" : "IGNITED"));
  };

  useEffect(() => {
    if (
      eSimTrust === "RESTRICTED" &&
      (activeTab === "vault" || activeTab === "sixg")
    ) {
      setActiveTab("dashboard");
      setHistory((prev) => {
        const h = [...prev, "dashboard" as Tab];
        setHistoryIndex(h.length - 1);
        return h;
      });
      toast.warning("Device Trust Required — Vault and 6G access restricted");
    }
  }, [eSimTrust, activeTab]);

  const {
    profile,
    swipeBaseline,
    typingBaseline,
    navBaseline,
    swipeCurrent,
    typingCurrent,
    navCurrent,
    recordSwipe,
    recordKeystroke,
    recordNavigation,
  } = useDigitalSmile();

  const prevProfileRef = useRef(profile);
  const nonGenericFiredRef = useRef(false);

  useEffect(() => {
    const prev = prevProfileRef.current;
    prevProfileRef.current = profile;
    if (
      profile === "Non-Generic" &&
      prev !== "Non-Generic" &&
      !nonGenericFiredRef.current &&
      !inactionActive
    ) {
      nonGenericFiredRef.current = true;
      setInactionActive(true);
      setBankModeActive(false);
      toast.warning(
        "Digital Smile: Non-Generic behavior — Inaction Safety engaged",
      );
    }
    if (profile !== "Non-Generic") nonGenericFiredRef.current = false;
  }, [profile, inactionActive]);

  const touchStartRef = useRef<{ y: number; t: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { y: e.touches[0].clientY, t: Date.now() };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaY = Math.abs(
      e.changedTouches[0].clientY - touchStartRef.current.y,
    );
    const durationMs = Date.now() - touchStartRef.current.t;
    touchStartRef.current = null;
    if (durationMs > 0 && deltaY > 5) recordSwipe(deltaY, durationMs);
  };

  const navigateTo = (tab: Tab) => {
    if (tab === activeTab) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(tab);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setActiveTab(tab);
    recordNavigation();
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const i = historyIndex - 1;
      setHistoryIndex(i);
      setActiveTab(history[i]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const i = historyIndex + 1;
      setHistoryIndex(i);
      setActiveTab(history[i]);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const toggleBankMode = () => {
    if (inactionActive) return;
    const next = !bankModeActive;
    setBankModeActive(next);
    toast(next ? "Bank Mode activated" : "Bank Mode deactivated", {
      duration: 2000,
    });
  };

  const toggleInaction = () => {
    const next = !inactionActive;
    setInactionActive(next);
    if (next) setBankModeActive(false);
    toast(next ? "Inaction Safety engaged" : "Inaction Safety disengaged", {
      duration: 2500,
    });
  };

  const isVaultLocked = vaultStatus === "locked";
  const isVaultTab = activeTab === "vault";
  const isMSimTab = activeTab === "msim";
  const isGOITab = activeTab === "goi";

  const addressBarBg = isMSimTab
    ? "oklch(0.11 0.025 290)"
    : isGOITab
      ? "oklch(0.11 0.02 150)"
      : isVaultTab
        ? isVaultLocked
          ? "oklch(0.14 0.03 20)"
          : "oklch(0.12 0.025 200)"
        : "oklch(0.14 0.016 255)";

  const addressBarBorder = isMSimTab
    ? "1px solid oklch(0.28 0.06 290 / 0.6)"
    : isGOITab
      ? "1px solid oklch(0.4 0.1 150 / 0.5)"
      : isVaultTab
        ? isVaultLocked
          ? "1px solid oklch(0.62 0.2 18 / 0.4)"
          : "1px solid oklch(0.82 0.14 200 / 0.4)"
        : "1px solid oklch(0.26 0.03 255)";

  const filteredTabs = TABS.filter(
    (tab) =>
      eSimTrust !== "RESTRICTED" || (tab.id !== "vault" && tab.id !== "sixg"),
  );

  return (
    <div className="min-h-screen bg-[oklch(0.08_0.012_255)] flex items-center justify-center p-4">
      <PrintableNotesModal
        open={printableNoteOpen}
        onClose={() => setPrintableNoteOpen(false)}
        bankModeActive={bankModeActive}
        vaultLocked={isVaultLocked}
      />

      {demoTourOpen && <DemoTour onClose={() => setDemoTourOpen(false)} />}

      <div
        className="w-full max-w-[420px] rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "oklch(0.11 0.016 255)",
          border: `1px solid ${bioStatus === "NORMAL" && bankModeActive && !inactionActive ? "oklch(0.55 0.12 75 / 0.6)" : "oklch(0.25 0.03 255)"}`,
          boxShadow:
            bioStatus === "NORMAL" && bankModeActive && !inactionActive
              ? "0 24px 80px oklch(0 0 0 / 0.6), 0 0 40px oklch(0.78 0.14 75 / 0.25), 0 0 80px oklch(0.78 0.14 75 / 0.12), inset 0 0 0 1px oklch(0.78 0.14 75 / 0.08)"
              : "0 24px 80px oklch(0 0 0 / 0.6)",
          transition: "box-shadow 0.8s ease, border-color 0.8s ease",
        }}
      >
        {/* ── Title bar */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 border-b"
          style={{
            background: "oklch(0.13 0.018 255)",
            borderColor: "oklch(0.22 0.025 255)",
          }}
        >
          {/* Traffic lights */}
          <div className="flex gap-1.5 flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-[oklch(0.65_0.22_15)]" />
            <div className="w-3 h-3 rounded-full bg-[oklch(0.78_0.12_75)]" />
            <div className="w-3 h-3 rounded-full bg-[oklch(0.65_0.16_150)]" />
          </div>

          {/* Nav arrows */}
          <div className="flex gap-0.5 flex-shrink-0">
            <button
              type="button"
              onClick={goBack}
              disabled={historyIndex === 0}
              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 hover:bg-navy-raised transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={goForward}
              disabled={historyIndex >= history.length - 1}
              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 hover:bg-navy-raised transition-colors"
              aria-label="Forward"
            >
              <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          {/* Address bar */}
          <div
            className="flex-1 flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono overflow-hidden min-w-0"
            style={{
              background: addressBarBg,
              border: addressBarBorder,
              transition: "all 0.3s ease",
            }}
          >
            {isMSimTab ? (
              <CreditCard
                className="w-2.5 h-2.5 flex-shrink-0"
                style={{ color: "oklch(0.62 0.22 290)" }}
              />
            ) : isGOITab ? (
              <Flag
                className="w-2.5 h-2.5 flex-shrink-0"
                style={{ color: "oklch(0.55 0.16 145)" }}
              />
            ) : isVaultTab ? (
              isVaultLocked ? (
                <LockKeyhole
                  className="w-2.5 h-2.5 flex-shrink-0"
                  style={{ color: "oklch(0.75 0.18 18)" }}
                />
              ) : (
                <LockKeyholeOpen
                  className="w-2.5 h-2.5 flex-shrink-0"
                  style={{ color: "oklch(0.82 0.14 200)" }}
                />
              )
            ) : (
              <Lock className="w-2.5 h-2.5 text-gold flex-shrink-0" />
            )}
            <span className="text-foreground/80 truncate flex-1 text-[10px] font-mono-code">
              {TAB_URLS[activeTab]}
            </span>
          </div>

          {/* 262626 Audit Badge */}
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: certified
                ? "oklch(0.65 0.16 150 / 0.1)"
                : "oklch(0.65 0.22 15 / 0.1)",
              border: `1px solid ${certified ? "oklch(0.65 0.16 150 / 0.35)" : "oklch(0.65 0.22 15 / 0.35)"}`,
            }}
            title={`262626 Self-Healing Audit — Score: ${auditScore}/100 — Last: ${lastAudit}`}
          >
            <ShieldCheck
              className="w-2.5 h-2.5 flex-shrink-0"
              style={{
                color: certified
                  ? "oklch(0.65 0.16 150)"
                  : "oklch(0.65 0.22 15)",
              }}
            />
            <span
              className="text-[8px] font-mono-code font-bold"
              style={{
                color: certified
                  ? "oklch(0.65 0.16 150)"
                  : "oklch(0.65 0.22 15)",
              }}
            >
              {auditScore}
            </span>
          </div>

          {/* Sovereign View */}
          <button
            type="button"
            data-ocid="sovereign_view.toggle"
            onClick={() => setSovereignViewActive((v) => !v)}
            className="w-6 h-6 rounded flex items-center justify-center transition-all flex-shrink-0"
            title="Sovereign View"
            style={{
              color: sovereignViewActive
                ? "oklch(0.78 0.12 75)"
                : "oklch(0.45 0.04 255)",
            }}
          >
            <Layers className="w-3 h-3" />
          </button>

          {/* Print */}
          <button
            type="button"
            data-ocid="print_note.open_modal_button"
            onClick={() => setPrintableNoteOpen(true)}
            className="w-6 h-6 rounded flex items-center justify-center transition-all flex-shrink-0"
            title="Print Note"
            style={{ color: "oklch(0.45 0.04 255)" }}
          >
            <Printer className="w-3 h-3" />
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={handleRefresh}
            className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-navy-raised transition-colors flex-shrink-0"
            aria-label="Refresh"
          >
            <RefreshCw
              className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* ── Bank Mode Toggle Bar */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{
            background: bankModeActive
              ? "oklch(0.13 0.025 150 / 0.6)"
              : "oklch(0.12 0.016 255)",
            borderColor: bankModeActive
              ? "oklch(0.45 0.14 150 / 0.35)"
              : "oklch(0.20 0.022 255)",
            transition: "all 0.35s ease",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
              style={{
                background: bankModeActive
                  ? "oklch(0.62 0.18 150 / 0.15)"
                  : "oklch(0.22 0.025 255 / 0.4)",
                border: bankModeActive
                  ? "1px solid oklch(0.62 0.18 150 / 0.4)"
                  : "1px solid oklch(0.28 0.03 255)",
              }}
            >
              {bankModeActive && (
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "oklch(0.7 0.18 150)" }}
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{
                    duration: 1.8,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />
              )}
              <span
                className="text-[10px] font-mono-code font-bold tracking-widest uppercase"
                style={{
                  color: bankModeActive
                    ? "oklch(0.75 0.17 150)"
                    : "oklch(0.5 0.03 255)",
                }}
              >
                Bank Mode
              </span>
            </div>
            <span
              className="text-[10px] font-body"
              style={{
                color: bankModeActive
                  ? "oklch(0.65 0.14 150)"
                  : "oklch(0.42 0.025 255)",
              }}
            >
              {bankModeActive ? "Active — Secure session live" : "Inactive"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Di=AI badge */}
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
              style={{
                background: inactionActive
                  ? "oklch(0.62 0.2 18 / 0.12)"
                  : bankModeActive
                    ? "oklch(0.62 0.18 150 / 0.12)"
                    : "oklch(0.22 0.025 255 / 0.4)",
                border: `1px solid ${inactionActive ? "oklch(0.62 0.2 18 / 0.35)" : bankModeActive ? "oklch(0.62 0.18 150 / 0.35)" : "oklch(0.28 0.03 255)"}`,
              }}
            >
              {inactionActive ? (
                <EyeOff
                  className="w-2.5 h-2.5"
                  style={{ color: "oklch(0.75 0.18 18)" }}
                />
              ) : (
                <Eye
                  className="w-2.5 h-2.5"
                  style={{
                    color: bankModeActive
                      ? "oklch(0.7 0.17 150)"
                      : "oklch(0.45 0.04 255)",
                  }}
                />
              )}
              <span
                className="text-[8px] font-mono-code font-bold"
                style={{
                  color: inactionActive
                    ? "oklch(0.75 0.18 18)"
                    : bankModeActive
                      ? "oklch(0.7 0.17 150)"
                      : "oklch(0.45 0.04 255)",
                }}
              >
                Di=AI{" "}
                {inactionActive
                  ? "INVISIBLE"
                  : bankModeActive
                    ? "VISIBLE"
                    : "STANDBY"}
              </span>
            </div>

            {bioStatus === "NORMAL" && bankModeActive && !inactionActive && (
              <motion.div
                data-ocid="third_eye.badge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                style={{
                  background: "oklch(0.78 0.12 75 / 0.1)",
                  border: "1px solid oklch(0.78 0.12 75 / 0.35)",
                }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{
                    duration: 1.6,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                  style={{ color: "oklch(0.78 0.12 75)", fontSize: "8px" }}
                >
                  ✶
                </motion.span>
                <span
                  className="text-[8px] font-mono-code font-bold"
                  style={{ color: "oklch(0.78 0.12 75)" }}
                >
                  3RD EYE
                </span>
              </motion.div>
            )}

            <button
              type="button"
              data-ocid="bank_mode.toggle"
              onClick={toggleBankMode}
              disabled={inactionActive}
              className="relative flex-shrink-0 focus:outline-none disabled:opacity-40"
            >
              <motion.div
                animate={{
                  background: bankModeActive
                    ? "oklch(0.62 0.18 150)"
                    : "oklch(0.26 0.03 255)",
                }}
                transition={{ duration: 0.25 }}
                className="w-10 h-5 rounded-full relative"
                style={{
                  boxShadow: bankModeActive
                    ? "0 0 8px oklch(0.62 0.18 150 / 0.5)"
                    : "none",
                }}
              >
                <motion.div
                  animate={{ x: bankModeActive ? 22 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                />
              </motion.div>
            </button>
          </div>
        </div>

        {/* ── Inaction Safety Bar */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{
            background: inactionActive
              ? "oklch(0.13 0.025 20 / 0.7)"
              : "oklch(0.11 0.014 255)",
            borderColor: inactionActive
              ? "oklch(0.55 0.18 20 / 0.4)"
              : "oklch(0.20 0.022 255)",
            transition: "all 0.35s ease",
          }}
        >
          <div className="flex items-center gap-2">
            <OctagonX
              className="w-3.5 h-3.5"
              style={{
                color: inactionActive
                  ? "oklch(0.75 0.18 18)"
                  : "oklch(0.45 0.04 255)",
              }}
            />
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
              style={{
                background: inactionActive
                  ? "oklch(0.62 0.2 18 / 0.15)"
                  : "oklch(0.22 0.025 255 / 0.4)",
                border: inactionActive
                  ? "1px solid oklch(0.62 0.2 18 / 0.4)"
                  : "1px solid oklch(0.28 0.03 255)",
              }}
            >
              {inactionActive && (
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "oklch(0.75 0.18 18)" }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{
                    duration: 1.2,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />
              )}
              <span
                className="text-[10px] font-mono-code font-bold tracking-widest uppercase"
                style={{
                  color: inactionActive
                    ? "oklch(0.75 0.18 18)"
                    : "oklch(0.5 0.03 255)",
                }}
              >
                Inaction Safety
              </span>
            </div>
            <span
              className="text-[10px] font-body"
              style={{
                color: inactionActive
                  ? "oklch(0.65 0.15 18)"
                  : "oklch(0.42 0.025 255)",
              }}
            >
              {inactionActive ? "ENGAGED" : "Standby"}
            </span>
          </div>
          <button
            type="button"
            data-ocid="inaction_safety.toggle"
            onClick={toggleInaction}
            className="relative flex-shrink-0"
          >
            <motion.div
              animate={{
                background: inactionActive
                  ? "oklch(0.65 0.22 18)"
                  : "oklch(0.26 0.03 255)",
              }}
              transition={{ duration: 0.25 }}
              className="w-10 h-5 rounded-full relative"
              style={{
                boxShadow: inactionActive
                  ? "0 0 10px oklch(0.65 0.22 18 / 0.55)"
                  : "none",
              }}
            >
              <motion.div
                animate={{ x: inactionActive ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
              />
            </motion.div>
          </button>
        </div>

        {/* ── Bio-Sovereign Bar */}
        <BioSovereignBar
          onDistressDetected={() => {
            if (!inactionActive) {
              setInactionActive(true);
              setBankModeActive(false);
              toast.error(
                "Bio-Sensor: Distress spike — Inaction Safety auto-engaged",
              );
            }
          }}
          onStatusChange={setBioStatus}
          inactionActive={inactionActive}
        />

        {/* ── Digital Smile Bar */}
        <DigitalSmileBar
          profile={profile}
          swipeCurrent={swipeCurrent}
          typingCurrent={typingCurrent}
          navCurrent={navCurrent}
          swipeBaseline={swipeBaseline}
          typingBaseline={typingBaseline}
          navBaseline={navBaseline}
          inactionActive={inactionActive}
        />

        {/* ── Device Trust Bar */}
        <DeviceTrustBar
          eSimTrust={eSimTrust}
          onToggle={toggleESimTrust}
          inactionActive={inactionActive}
        />

        {/* ── Content area */}
        <div
          className="relative"
          style={{
            background: isMSimTab
              ? "oklch(0.09 0.018 290)"
              : isGOITab
                ? "oklch(0.10 0.015 150)"
                : "oklch(0.12 0.018 255)",
            height: "calc(100vh - 220px)",
            minHeight: "520px",
            maxHeight: "680px",
            transition: "background 0.3s ease",
          }}
        >
          {sovereignViewActive && (
            <SovereignOverlay onClose={() => setSovereignViewActive(false)} />
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${refreshKey}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {activeTab === "dashboard" && (
                <DashboardPage
                  vaultLocked={isVaultLocked}
                  bankModeActive={bankModeActive}
                  inactionActive={inactionActive}
                  digitalSmileProfile={profile}
                  onOpenPrintNote={() => setPrintableNoteOpen(true)}
                />
              )}
              {activeTab === "transactions" && (
                <TransactionsPage inactionActive={inactionActive} />
              )}
              {activeTab === "chat" && (
                <ChatPage
                  inactionActive={inactionActive}
                  onKeystroke={recordKeystroke}
                />
              )}
              {activeTab === "sensors" && (
                <SensorsPage
                  inactionActive={inactionActive}
                  bioStatus={bioStatus}
                />
              )}
              {activeTab === "vault" && (
                <VaultPage
                  vaultStatus={vaultStatus}
                  onVaultStatusChange={setVaultStatus}
                  inactionActive={inactionActive}
                />
              )}
              {activeTab === "cloud" && (
                <CloudPage inactionActive={inactionActive} />
              )}
              {activeTab === "brain" && (
                <MoiraBrainPage
                  inactionActive={inactionActive}
                  eSimTrust={eSimTrust}
                  onESimTrustChange={setESimTrust}
                />
              )}
              {activeTab === "backoffice" && (
                <BackofficePage inactionActive={inactionActive} />
              )}
              {activeTab === "library" && (
                <LibraryPage inactionActive={inactionActive} />
              )}
              {activeTab === "msim" && (
                <MSimStrongRoomPage inactionActive={inactionActive} />
              )}
              {activeTab === "sixg" && (
                <SixGPage inactionActive={inactionActive} />
              )}
              {activeTab === "goi" && (
                <GOIPage inactionActive={inactionActive} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Bottom navigation */}
        <div
          className="flex items-stretch border-t overflow-x-auto scrollbar-hide"
          style={{
            background: "oklch(0.13 0.018 255)",
            borderColor: "oklch(0.22 0.025 255)",
          }}
        >
          {filteredTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isVaultNavTab = tab.id === "vault";
            const isMSimNavTab = tab.id === "msim";
            const isGOINavTab = tab.id === "goi";

            let activeColor: string | undefined;
            if (isActive) {
              if (isMSimNavTab) activeColor = "oklch(0.82 0.16 290)";
              else if (isVaultNavTab)
                activeColor = isVaultLocked
                  ? "oklch(0.75 0.18 18)"
                  : "oklch(0.82 0.14 200)";
              else if (isGOINavTab) activeColor = "oklch(0.65 0.16 145)";
            }

            const indicatorColor =
              isMSimNavTab && isActive
                ? "oklch(0.62 0.22 290)"
                : isVaultNavTab && isActive
                  ? isVaultLocked
                    ? "oklch(0.75 0.18 18)"
                    : "oklch(0.82 0.14 200)"
                  : isGOINavTab && isActive
                    ? "oklch(0.55 0.16 145)"
                    : "oklch(0.78 0.12 75)";

            return (
              <button
                type="button"
                key={tab.id}
                data-ocid={`nav.${tab.id}.tab`}
                onClick={() => navigateTo(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-1 transition-colors relative min-w-[36px] ${
                  isActive && !activeColor
                    ? "text-gold"
                    : isActive
                      ? ""
                      : "text-muted-foreground hover:text-foreground"
                }`}
                style={activeColor ? { color: activeColor } : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ background: indicatorColor }}
                  />
                )}
                <div className="relative">
                  <Icon
                    className={`w-3.5 h-3.5 ${isActive ? "scale-110" : ""} transition-transform`}
                  />
                  {isVaultNavTab && (
                    <div
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-[oklch(0.13_0.018_255)]"
                      style={{
                        background: isVaultLocked
                          ? "oklch(0.62 0.2 18)"
                          : "oklch(0.7 0.17 150)",
                      }}
                    />
                  )}
                  {isMSimNavTab && (
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-[oklch(0.13_0.018_255)]"
                      style={{ background: "oklch(0.62 0.22 290)" }}
                    />
                  )}
                </div>
                <span className="text-[8px] font-body font-medium leading-none">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Copyright footer */}
        <div
          className="text-center py-1.5"
          style={{
            background: "oklch(0.10 0.014 255)",
            borderTop: "1px solid oklch(0.18 0.02 255)",
          }}
        >
          <p
            className="text-[9px] font-mono-code"
            style={{ color: "oklch(0.35 0.03 255)" }}
          >
            © Copyright P.S. Thimaia · CC BY-NC-ND · Make in India · Powered by
            26.ai
          </p>
        </div>
      </div>

      {/* ── Parliamentary Demo Tour floating button */}
      <motion.button
        type="button"
        data-ocid="demo_tour.open_modal_button"
        onClick={() => setDemoTourOpen(true)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-full font-display font-bold text-xs tracking-wider z-40"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.24 0.06 75), oklch(0.20 0.04 75))",
          border: "1px solid oklch(0.55 0.12 75 / 0.6)",
          color: "oklch(0.92 0.1 75)",
          boxShadow:
            "0 4px 24px oklch(0.78 0.12 75 / 0.35), 0 0 0 1px oklch(0.45 0.08 75 / 0.2)",
        }}
      >
        <span>▶</span> DEMO TOUR
      </motion.button>
    </div>
  );
}
