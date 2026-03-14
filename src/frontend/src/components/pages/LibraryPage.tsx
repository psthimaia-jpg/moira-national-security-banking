import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Clock,
  FileText,
  Layers,
  Search,
  Star,
  Tag,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

// ── Design constants ──────────────────────────────────────
const CARD_BG = "oklch(0.155 0.022 255)";
const CARD_BORDER = "oklch(0.25 0.03 255)";
const GOLD = "oklch(0.78 0.12 75)";
const GOLD_DIM = "oklch(0.78 0.12 75 / 0.12)";
const GOLD_BORDER = "oklch(0.78 0.12 75 / 0.3)";

// ── Category config ──────────────────────────────────────
const CATEGORIES = [
  "All",
  "Banking Guides",
  "Security",
  "Compliance",
  "Moira Manuals",
  "GOI Documents",
] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_STYLES: Record<
  Exclude<Category, "All">,
  { color: string; bg: string; border: string }
> = {
  "Banking Guides": {
    color: "oklch(0.7 0.16 220)",
    bg: "oklch(0.7 0.16 220 / 0.12)",
    border: "oklch(0.7 0.16 220 / 0.3)",
  },
  Security: {
    color: "oklch(0.78 0.12 75)",
    bg: "oklch(0.78 0.12 75 / 0.12)",
    border: "oklch(0.78 0.12 75 / 0.3)",
  },
  Compliance: {
    color: "oklch(0.68 0.18 295)",
    bg: "oklch(0.68 0.18 295 / 0.12)",
    border: "oklch(0.68 0.18 295 / 0.3)",
  },
  "Moira Manuals": {
    color: "oklch(0.68 0.16 160)",
    bg: "oklch(0.68 0.16 160 / 0.12)",
    border: "oklch(0.68 0.16 160 / 0.3)",
  },
  "GOI Documents": {
    color: "oklch(0.72 0.18 50)",
    bg: "oklch(0.72 0.18 50 / 0.12)",
    border: "oklch(0.72 0.18 50 / 0.3)",
  },
};

// ── Static library data ───────────────────────────────────
interface LibraryResourceLocal {
  id: string;
  title: string;
  category: Exclude<Category, "All">;
  description: string;
  body: string;
  tags: string[];
  readMinutes: number;
  featured: boolean;
}

const LIBRARY_RESOURCES: LibraryResourceLocal[] = [
  {
    id: "1",
    title: "Getting Started with Moira SmartBank",
    category: "Banking Guides",
    description:
      "Your complete onboarding guide to Moira SmartBank AI — account setup, navigation, and first steps to secure digital banking.",
    body: `Welcome to Moira SmartBank AI, the next generation of sovereign digital banking. This guide will walk you through everything you need to get started, from creating your account to executing your first transaction.

Begin by navigating to the Dashboard tab using the bottom navigation bar. You will see your account balance, financial summary, and quick-action buttons. The Bank Mode toggle at the top of the browser chrome activates your secure banking session — always ensure it is green before initiating any transaction.

To set up your vault, navigate to the Vault tab and enter your 6-digit PIN (default: 262626). The 26.ai security engine will authenticate your session and unlock your protected financial assets including Savings, Investments, Crypto, and Credit accounts.

For AI assistance at any time, tap the Moira AI tab to chat with our intelligent banking assistant. You can ask about your balance, spending summaries, budget advice, savings tips, and more. Moira is always available and never sleeps.`,
    tags: ["onboarding", "account-setup", "navigation", "first-steps"],
    readMinutes: 5,
    featured: true,
  },
  {
    id: "2",
    title: "How to Transfer Funds Securely",
    category: "Banking Guides",
    description:
      "Step-by-step guide to initiating, verifying, and confirming secure fund transfers using the Moira Fraud-Proof Escrow system.",
    body: `Transferring funds securely within Moira SmartBank AI is a multi-layered process designed for both speed and safety. The system employs the Di=AI Behavioral DNA engine to monitor every transfer for anomalies.

To initiate a transfer, tap the Quick Actions panel on your Dashboard and select "Transfer." You will be prompted to enter the recipient details, amount, and a memo. Before confirming, the Bio-Sovereign firewall will validate your biometric pulse reading against its baseline.

All transfers above $1,000 are automatically ring-fenced in the Fraud-Proof Escrow system. Funds are held until a Proof of Delivery handshake is completed. You will find the escrow panel inside the Vault tab once unlocked with your PIN.

If the Inaction Safety switch is engaged or a behavioral anomaly is detected, the transfer will be paused automatically. Review the Digital Smile bar status and re-authenticate to resume. This protection layer operates invisibly in the background — the Di=AI philosophy of Visible to Invisible.`,
    tags: ["transfer", "escrow", "fraud-protection", "biometric"],
    readMinutes: 6,
    featured: false,
  },
  {
    id: "3",
    title: "Understanding Your Account Dashboard",
    category: "Banking Guides",
    description:
      "A deep dive into the Moira Dashboard — balance cards, financial KPIs, spending categories, and the live transaction feed.",
    body: `The Moira Dashboard is your command center for financial visibility. Every element is designed to give you maximum insight with minimal cognitive load.

At the top, the Account Card displays your current balance, account type, and account number. When Bank Mode is active, a green pulse badge confirms your session is live and secure. If the vault is locked, sensitive numbers are blurred for privacy — unlock via the Vault tab to reveal them.

The Financial Summary section shows four key metrics: Total Balance, Monthly Income, Monthly Expenses, and Savings Rate. These figures are pulled live from your transaction history and update in real time as new entries are added.

Below the summary, the Spending by Category breakdown gives you a visual pie chart of your expenditure. Six categories are tracked by default: Food, Transport, Entertainment, Utilities, Healthcare, and Shopping. The Recent Transactions feed shows your last five movements with category icons, amounts, and timestamps.`,
    tags: ["dashboard", "balance", "transactions", "spending"],
    readMinutes: 4,
    featured: false,
  },
  {
    id: "4",
    title: "26.ai Vault Security Overview",
    category: "Security",
    description:
      "Technical overview of the 26.ai vault architecture — PIN authentication, breach detection, asset protection, and security logging.",
    body: `The Moira Vault is powered by 26.ai, a next-generation cryptographic security engine purpose-built for sovereign financial data protection. This document provides a technical overview of its architecture and security model.

Authentication uses a 6-digit PIN that is hashed and compared against a secure store. Three consecutive incorrect attempts trigger the Breach Alert Protocol, which displays a full-screen warning overlay and initiates a 30-second mandatory lockout. All attempts — successful and failed — are written to the immutable Security Log with millisecond timestamps.

Protected assets within the vault are never stored in plaintext. The four asset categories (Savings, Investments, Crypto, and Credit) are encrypted at rest and only decrypted in-memory during an active authenticated session. Session tokens expire automatically after the configured auto-lock timeout.

The Fraud-Proof Escrow module within the vault uses a two-phase commit protocol: funds are ring-fenced on initiation and released only on receipt of a cryptographically signed Satisfaction Handshake. This provides tamper-evident, end-to-end delivery confirmation for high-value transfers.`,
    tags: ["vault", "26.ai", "PIN", "encryption", "escrow"],
    readMinutes: 7,
    featured: false,
  },
  {
    id: "5",
    title: "Bio-Sovereign Authentication Guide",
    category: "Security",
    description:
      "How the Di=AI Firewall uses real-time Heart Rate, Blood Pressure, and SpO2 data as a continuous biometric security layer.",
    body: `Bio-Sovereign Authentication is the cornerstone of Moira's human-centric security philosophy. Unlike traditional authentication that happens once at login, Bio-Sovereign provides continuous, passive monitoring throughout your entire session.

The Di=AI Firewall Bio-Sensor Bar monitors three vital metrics in real time: Heart Rate (bpm), Blood Pressure (Systolic/Diastolic), and SpO2 (oxygen saturation). These readings are sampled every 2.5 seconds and compared against your established personal baseline.

Three status tiers govern the system's response. NORMAL status (green) means all metrics are within your personal baseline range — no action is taken and the session continues. ELEVATED status (amber) means one or more metrics have risen above the comfortable threshold. The system records this event but does not interrupt the session. DISTRESS status (red) means a significant spike has been detected, consistent with distress or duress scenarios. The Inaction Safety switch is automatically engaged, Bank Mode is deactivated, and you are prompted to re-authenticate.

Bio-Sovereign data is processed entirely on-device and never transmitted to external servers. The Di=AI principle of "Invisible" means users experience seamless banking while the firewall works silently in the background.`,
    tags: ["biometric", "heart-rate", "blood-pressure", "SpO2", "Di=AI"],
    readMinutes: 8,
    featured: false,
  },
  {
    id: "6",
    title: "Di=AI Behavioral Security Explained",
    category: "Security",
    description:
      "The Digital Smile engine — how behavioral DNA patterns distinguish generic users from anomalous activity in real time.",
    body: `Di=AI Behavioral Security is built on the philosophy that your digital fingerprint is as unique as your physical one. The Digital Smile engine observes three dimensions of behavior to build your Behavioral DNA profile.

Swipe Velocity measures the speed of your scroll gestures in pixels per millisecond. Typing Cadence measures the average gap between keystrokes in your chat interactions. Navigation Rhythm measures the average time elapsed between tab changes. Together, these three signals form a unique signature that is learned and stored locally on your device.

During the Calibration phase (first 5-10 interactions), the system builds your baseline. Once calibrated, the Digital Smile bar displays a green ":)" indicator — the "Visible" state where you experience frictionless, seamless banking. If any metric deviates more than 40% from your baseline, the system enters the "Non-Generic" state.

A Non-Generic detection triggers the Inaction Safety switch automatically. If a simultaneous Bio-Sovereign DISTRESS or ELEVATED reading is present, the system escalates to a Paramount Security alert — the highest threat tier, indicating a potential duress or fraud scenario. The Di=AI Invisible state then handles all complex fraud-intercepts in the background without interrupting the legitimate user's recovery flow.`,
    tags: ["behavioral-DNA", "Digital-Smile", "swipe", "typing", "anomaly"],
    readMinutes: 9,
    featured: false,
  },
  {
    id: "7",
    title: "KYC & AML Compliance Framework",
    category: "Compliance",
    description:
      "Moira's Know Your Customer and Anti-Money Laundering framework aligned with FATF recommendations and Indian PMLA standards.",
    body: `The Moira SmartBank AI platform is built with compliance as a first-class architectural concern. The KYC and AML framework is aligned with FATF (Financial Action Task Force) recommendations and India's Prevention of Money Laundering Act (PMLA) 2002 as amended.

KYC verification occurs at onboarding and is re-validated at periodic intervals defined by the risk tier assigned to each customer. Three tiers are defined: Standard (annual re-KYC), Enhanced (semi-annual), and High-Risk (quarterly). Customer due diligence (CDD) and Enhanced Due Diligence (EDD) procedures are automated through the Moira Admin Backoffice.

The AML Transaction Monitoring module screens every transaction in real time against a rule set derived from FATF Recommendations 10, 11, and 20. Structuring patterns, velocity thresholds, and geographic risk scores are applied. Any flagged transaction is escalated to the Compliance Review queue in the Admin Backoffice and held pending a Suspicious Transaction Report (STR) determination.

All KYC records, AML alerts, and STR filings are retained for a minimum of 5 years in compliance with PMLA Section 12 record-keeping requirements. The audit trail is immutable and cryptographically timestamped.`,
    tags: ["KYC", "AML", "FATF", "PMLA", "compliance", "STR"],
    readMinutes: 10,
    featured: false,
  },
  {
    id: "8",
    title: "ITSAR Regulatory Overview",
    category: "Compliance",
    description:
      "Information Technology (Significant Aggregators) Rules compliance guide for Moira SmartBank AI operations in India.",
    body: `The Information Technology (Significant Aggregators) Rules, commonly referred to as ITSAR, govern entities that aggregate and process significant volumes of user data in India. Moira SmartBank AI operates under these rules and maintains full compliance.

Key obligations under ITSAR include the appointment of a Grievance Officer based in India, maintenance of a User Trust Score methodology, and submission of periodic compliance reports to the Ministry of Electronics and Information Technology (MeitY). All three obligations are fulfilled through the Moira Governance structure.

The ITSAR Compliance Toggles within the Moira Admin Backoffice allow authorized administrators to activate or suspend data processing features in response to regulatory directives. Toggle states are logged with timestamps and administrator Principal IDs for full auditability.

Data residency requirements under ITSAR mandate that certain sensitive financial data of Indian citizens is stored on servers located within India. Moira fulfils this requirement through its Internet Computer Protocol (ICP) subnet allocation policy, which includes dedicated India-region nodes. The Health Ping system in the Moira Brain continuously verifies the integrity and availability of these nodes.`,
    tags: ["ITSAR", "MeitY", "data-residency", "compliance", "India"],
    readMinutes: 8,
    featured: false,
  },
  {
    id: "9",
    title: "Moira Brain Self-Healing Reference",
    category: "Moira Manuals",
    description:
      "Technical reference for the Moira Brain's five security pillars: health pings, self-healing toolkit, integrity shield, energy optimization, and global data sync.",
    body: `The Moira Brain is the autonomous intelligence core of Moira SmartBank AI. It operates across five Security & Maintenance pillars that collectively ensure the platform remains operational, secure, and compliant at all times.

Pillar 1 — Autonomous Health Pings: Six system components are continuously monitored with 3-second polling intervals. Components include the Authentication Engine, Transaction Processor, Vault Security, Bio-Sensor Array, 6G Gateway, and Compliance Engine. Each component reports a READY, CHECKING, or FAULT state. A FAULT state triggers an immediate notification to the Admin Backoffice.

Pillar 2 — Self-Healing Toolkit: When a component fault is detected, the Self-Healing Toolkit initiates a diagnostic scan followed by a restore-to-default-state procedure. Recovery events are logged to the immutable Health Log accessible in the Admin Backoffice. The toolkit can also be manually triggered by an authorized administrator.

Pillar 3 — Criminal Liability Shield: The integrity hash of the Moira codebase is continuously verified against a known-good baseline. Any tampering attempt is logged, and the system displays the ITSA Section 66B warning banner. This provides a cryptographic audit trail for any potential litigation.

Pillar 4 — Energy Optimization: Brain Priority Mode reroutes available computational resources to keep the Brain's critical monitoring functions alive even under high system load. This ensures zero-downtime operation for security-critical processes.

Pillar 5 — Priority Global Data: The system synchronizes with USA Switch Stations (US-EAST, US-WEST, US-CENTRAL, US-GOV, US-FINANCIAL) every 4 seconds to receive critical regulatory and threat-intelligence updates. Force Sync is available for immediate on-demand synchronization.`,
    tags: [
      "brain",
      "self-healing",
      "health-pings",
      "integrity",
      "energy",
      "global-sync",
    ],
    readMinutes: 12,
    featured: false,
  },
  {
    id: "10",
    title: "6G Architecture Integration Manual",
    category: "Moira Manuals",
    description:
      "How Moira SmartBank AI integrates 6G-optimized networking — edge nodes, quantum-safe keys, latency optimization, and URLLC slicing.",
    body: `The 6G Architecture Integration in Moira SmartBank AI represents the platform's preparedness for next-generation networking standards. This manual describes the architecture, components, and operational procedures for the 6G module.

The 6G Network Panel provides a real-time view of global edge nodes. Six node locations are monitored: US-EAST, US-WEST, EU-CENTRAL, APAC, IN-SOUTH, and IN-NORTH. Each node reports its status (ACTIVE, STANDBY, or FAULT), current latency in milliseconds, and load percentage. Node metrics refresh automatically every 3 seconds.

Quantum-Safe Key Rotation is a critical security feature of the 6G module. A 256-character cryptographic key is generated and rotated on a configurable schedule. The rotation procedure ensures forward secrecy — a compromised key cannot decrypt previously captured traffic. Manual rotation is available via the Rotate Key button.

The Frequency Band Selector allows switching between sub-6GHz and mmWave profiles. The sub-6GHz profile prioritizes coverage and penetration, suitable for standard banking operations. The mmWave profile prioritizes ultra-low latency, suitable for high-frequency trading and time-sensitive financial operations.

Network Readiness Score is a composite metric combining latency, node availability, and quantum key health into a single 0-100 score. A score above 80 is required for high-value transaction authorization.`,
    tags: ["6G", "edge-nodes", "quantum-safe", "URLLC", "latency", "mmWave"],
    readMinutes: 11,
    featured: false,
  },
  {
    id: "11",
    title: "Digital Smile Behavioral DNA Manual",
    category: "Moira Manuals",
    description:
      "Operator manual for the Digital Smile Behavioral DNA engine — calibration, threshold tuning, and behavioral pattern analysis.",
    body: `This manual is intended for Moira platform administrators and security engineers who need to understand, configure, and monitor the Digital Smile Behavioral DNA engine.

The engine operates in three lifecycle phases. Phase 1 — Calibration: The engine collects interaction samples across three behavioral channels (swipe velocity, typing cadence, navigation rhythm). Calibration completes after a statistically sufficient sample set has been collected. The typical calibration period is 5-10 interactions. During calibration, no anomaly detection is active.

Phase 2 — Baseline Establishment: Once calibration completes, a rolling baseline is computed for each channel using an exponential moving average (EMA). The EMA smooths out transient fluctuations while remaining responsive to genuine behavioral drift over time.

Phase 3 — Active Monitoring: The engine continuously compares live readings to the established baseline. A deviation threshold of 40% triggers a Non-Generic flag on that channel. If two or more channels flag simultaneously, the system escalates to a Non-Generic behavioral state and engages the Inaction Safety switch.

Administrators can view live metric readings in the Digital Smile Bar located in the browser chrome. Expand the bar to see Swipe Velocity, Typing Cadence, and Navigation Cadence with their current vs. baseline values. For cross-referencing with Bio-Sovereign data, both panels are visible simultaneously in the expanded state.`,
    tags: [
      "behavioral-DNA",
      "calibration",
      "EMA",
      "threshold",
      "anomaly-detection",
    ],
    readMinutes: 10,
    featured: false,
  },
  {
    id: "12",
    title: "GOI Command Dashboard Directive",
    category: "GOI Documents",
    description:
      "Official Government of India directive establishing the operational framework for the Moira Command Dashboard integration with national financial infrastructure.",
    body: `Government of India | Ministry of Finance & Ministry of Electronics and Information Technology
Directive Reference: MOF/MEIT/MOIRA/2026/CMD-001

Subject: Establishment of the Moira Command Dashboard as a National Financial Intelligence Interface

This directive establishes the Moira Command Dashboard as the authorised interface for real-time financial intelligence aggregation and command dissemination within designated national financial institutions.

Section 1 — Scope: The Moira Command Dashboard (GOI Tab) is authorised for use by personnel holding a valid GOI Principal ID registered in the Moira Admin Backoffice. Access is role-gated — only principals assigned the "admin" role may access the full Command Panel, Financial Command Table, and Emergency Controls.

Section 2 — System Status Monitoring: The GOI Command Dashboard provides real-time visibility into Backend Health, ICP Network Status, System Uptime, and Active Sessions. These metrics are mandatory reporting requirements under the National Digital Finance Act.

Section 3 — Emergency Controls: The "LOCK ALL VAULTS" function is reserved for use during declared financial emergencies as defined under Section 45 of the Banking Regulation Act. The "BROADCAST ALERT" function is to be used only for verified national security events. Both controls generate immutable audit log entries.

Section 4 — Sensor Telemetry: The GOI Command Dashboard aggregates sensor telemetry from all active Moira instances, providing a national-level view of device sensor data. This data feeds directly into the National Cyber Threat Intelligence Platform (NCTIP).`,
    tags: ["GOI", "government", "command", "directive", "national-security"],
    readMinutes: 9,
    featured: false,
  },
];

// ── Props ─────────────────────────────────────────────────
interface LibraryPageProps {
  inactionActive: boolean;
}

// ── Category Badge ────────────────────────────────────────
function CategoryBadge({
  category,
  small,
}: {
  category: Exclude<Category, "All">;
  small?: boolean;
}) {
  const style = CATEGORY_STYLES[category];
  return (
    <span
      className={`inline-flex items-center rounded-full font-mono-code font-bold uppercase tracking-wider ${small ? "text-[8px] px-1.5 py-0.5" : "text-[9px] px-2 py-0.5"}`}
      style={{
        color: style.color,
        background: style.bg,
        border: `1px solid ${style.border}`,
      }}
    >
      {category}
    </span>
  );
}

// ── Resource Card ─────────────────────────────────────────
function ResourceCard({
  resource,
  index,
  onRead,
  disabled,
}: {
  resource: LibraryResourceLocal;
  index: number;
  onRead: (resource: LibraryResourceLocal) => void;
  disabled: boolean;
}) {
  const isFeatured = resource.featured;

  return (
    <motion.div
      data-ocid={`library.resource.item.${index}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="relative rounded-xl p-3 group cursor-pointer transition-all duration-200"
      style={{
        background: isFeatured ? "oklch(0.16 0.025 75 / 0.25)" : CARD_BG,
        border: isFeatured
          ? `1px solid ${GOLD_BORDER}`
          : `1px solid ${CARD_BORDER}`,
        boxShadow: isFeatured ? "0 0 16px oklch(0.78 0.12 75 / 0.08)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!isFeatured) {
          (e.currentTarget as HTMLDivElement).style.borderColor =
            "oklch(0.35 0.04 255)";
          (e.currentTarget as HTMLDivElement).style.background =
            "oklch(0.18 0.026 255)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isFeatured) {
          (e.currentTarget as HTMLDivElement).style.borderColor = CARD_BORDER;
          (e.currentTarget as HTMLDivElement).style.background = CARD_BG;
        }
      }}
    >
      {/* Featured ribbon */}
      {isFeatured && (
        <div
          className="absolute top-0 right-0 flex items-center gap-1 px-2 py-0.5 rounded-bl-lg rounded-tr-xl"
          style={{
            background: "oklch(0.78 0.12 75 / 0.15)",
            border: `1px solid ${GOLD_BORDER}`,
            borderTop: "none",
            borderRight: "none",
          }}
        >
          <Star
            className="w-2.5 h-2.5"
            fill="oklch(0.78 0.12 75)"
            style={{ color: GOLD }}
          />
          <span
            className="text-[8px] font-mono-code font-bold tracking-widest uppercase"
            style={{ color: GOLD }}
          >
            FEATURED
          </span>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-display font-semibold leading-tight truncate mb-1"
            style={{
              color: isFeatured ? GOLD : "oklch(0.9 0.01 255)",
            }}
          >
            {resource.title}
          </h3>
          <CategoryBadge category={resource.category} small />
        </div>
        <div
          className="flex items-center gap-1 flex-shrink-0 mt-0.5"
          style={{ color: "oklch(0.5 0.04 255)" }}
        >
          <Clock className="w-2.5 h-2.5" />
          <span className="text-[9px] font-mono-code">
            {resource.readMinutes}m
          </span>
        </div>
      </div>

      {/* Description */}
      <p
        className="text-[11px] font-body leading-relaxed mb-3 line-clamp-2"
        style={{ color: "oklch(0.6 0.04 255)" }}
      >
        {resource.description}
      </p>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 flex-wrap">
          {resource.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[8px] font-mono-code px-1.5 py-0.5 rounded-md"
              style={{
                color: "oklch(0.5 0.04 255)",
                background: "oklch(0.18 0.022 255)",
                border: "1px solid oklch(0.25 0.03 255)",
              }}
            >
              #{tag}
            </span>
          ))}
          {resource.tags.length > 2 && (
            <span
              className="text-[8px] font-mono-code"
              style={{ color: "oklch(0.45 0.04 255)" }}
            >
              +{resource.tags.length - 2}
            </span>
          )}
        </div>
        <Button
          data-ocid={`library.read.open_modal_button.${index}`}
          size="sm"
          disabled={disabled}
          onClick={() => onRead(resource)}
          className="h-6 px-2.5 text-[10px] font-mono-code font-bold rounded-lg transition-all duration-150"
          style={
            isFeatured
              ? {
                  background: "oklch(0.78 0.12 75 / 0.15)",
                  border: `1px solid ${GOLD_BORDER}`,
                  color: GOLD,
                }
              : {}
          }
          variant={isFeatured ? "ghost" : "secondary"}
        >
          <BookOpen className="w-2.5 h-2.5 mr-1" />
          Read
        </Button>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function LibraryPage({ inactionActive }: LibraryPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [selectedResource, setSelectedResource] =
    useState<LibraryResourceLocal | null>(null);

  // Filter logic
  const filteredResources = useMemo(() => {
    let results = LIBRARY_RESOURCES;

    if (activeCategory !== "All") {
      results = results.filter((r) => r.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return results;
  }, [searchQuery, activeCategory]);

  // Featured resource (from filtered set, prefer top-level featured)
  const featuredResource = useMemo(
    () => filteredResources.find((r) => r.featured) ?? null,
    [filteredResources],
  );

  // Non-featured list (featured shown separately)
  const nonFeaturedResources = useMemo(
    () => filteredResources.filter((r) => !r.featured),
    [filteredResources],
  );

  // All resources for indexing (featured first for stable markers)
  const allDisplayedInOrder = useMemo(() => {
    if (!featuredResource) return nonFeaturedResources;
    return [featuredResource, ...nonFeaturedResources];
  }, [featuredResource, nonFeaturedResources]);

  const totalDocs = LIBRARY_RESOURCES.length;
  const totalCategories = CATEGORIES.length - 1; // exclude "All"

  return (
    <div className="h-full flex flex-col">
      {/* ── Header ───────────────────────────────────── */}
      <div
        className="px-4 pt-4 pb-3 flex-shrink-0"
        style={{
          background: "oklch(0.115 0.016 255)",
          borderBottom: "1px solid oklch(0.22 0.025 255)",
        }}
      >
        {/* Title row */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: GOLD_DIM,
              border: `1px solid ${GOLD_BORDER}`,
            }}
          >
            <BookOpen className="w-3.5 h-3.5" style={{ color: GOLD }} />
          </div>
          <div>
            <h1
              className="text-sm font-display font-bold leading-tight"
              style={{ color: GOLD }}
            >
              Moira Library
            </h1>
            <p
              className="text-[9px] font-mono-code"
              style={{ color: "oklch(0.5 0.04 255)" }}
            >
              Knowledge Base & Resource Hub
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-3 mb-3">
          {[
            {
              icon: FileText,
              label: `${totalDocs} Documents`,
            },
            {
              icon: Layers,
              label: `${totalCategories} Categories`,
            },
            {
              icon: Clock,
              label: "Updated: Today",
            },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1">
              <Icon
                className="w-2.5 h-2.5"
                style={{ color: "oklch(0.55 0.08 75)" }}
              />
              <span
                className="text-[9px] font-mono-code"
                style={{ color: "oklch(0.55 0.04 255)" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Search input */}
        <div className="relative mb-3">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
            style={{ color: "oklch(0.5 0.04 255)" }}
          />
          <Input
            data-ocid="library.search_input"
            type="text"
            placeholder="Search documents, guides, tags…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={inactionActive}
            className="h-7 pl-7 pr-3 text-[11px] font-body rounded-lg"
            style={{
              background: "oklch(0.155 0.022 255)",
              border: "1px solid oklch(0.25 0.03 255)",
              color: "oklch(0.88 0.01 255)",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              aria-label="Clear search"
            >
              <X
                className="w-2.5 h-2.5"
                style={{ color: "oklch(0.5 0.04 255)" }}
              />
            </button>
          )}
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const catStyle =
              cat !== "All"
                ? CATEGORY_STYLES[cat as Exclude<Category, "All">]
                : null;

            return (
              <button
                key={cat}
                type="button"
                data-ocid="library.category.tab"
                onClick={() => {
                  if (!inactionActive) setActiveCategory(cat);
                }}
                disabled={inactionActive}
                className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-mono-code font-bold uppercase tracking-wider transition-all duration-150"
                style={
                  isActive
                    ? {
                        background: catStyle ? catStyle.bg : GOLD_DIM,
                        border: `1px solid ${catStyle ? catStyle.border : GOLD_BORDER}`,
                        color: catStyle ? catStyle.color : GOLD,
                      }
                    : {
                        background: "oklch(0.155 0.022 255)",
                        border: "1px solid oklch(0.23 0.028 255)",
                        color: "oklch(0.52 0.04 255)",
                      }
                }
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Resource list ───────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3 space-y-2">
        {/* Inaction lock overlay message */}
        <AnimatePresence>
          {inactionActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl px-3 py-2 flex items-center gap-2 mb-1"
              style={{
                background: "oklch(0.62 0.2 18 / 0.08)",
                border: "1px solid oklch(0.62 0.2 18 / 0.3)",
              }}
            >
              <span
                className="text-[10px] font-mono-code"
                style={{ color: "oklch(0.75 0.18 18)" }}
              >
                INACTION SAFETY — Library in read-only mode
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {allDisplayedInOrder.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
            data-ocid="library.empty_state"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{
                background: "oklch(0.155 0.022 255)",
                border: "1px solid oklch(0.25 0.03 255)",
              }}
            >
              <Search
                className="w-4 h-4"
                style={{ color: "oklch(0.45 0.04 255)" }}
              />
            </div>
            <p
              className="text-xs font-display font-semibold mb-1"
              style={{ color: "oklch(0.55 0.04 255)" }}
            >
              No documents found
            </p>
            <p
              className="text-[10px] font-body"
              style={{ color: "oklch(0.42 0.03 255)" }}
            >
              Try a different search or category filter
            </p>
          </motion.div>
        )}

        {/* Featured resource */}
        {featuredResource && (
          <ResourceCard
            resource={featuredResource}
            index={1}
            onRead={setSelectedResource}
            disabled={inactionActive}
          />
        )}

        {/* Regular resources */}
        {nonFeaturedResources.map((resource, i) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            index={featuredResource ? i + 2 : i + 1}
            onRead={setSelectedResource}
            disabled={inactionActive}
          />
        ))}

        {/* Bottom padding */}
        <div className="h-4" />
      </div>

      {/* ── Detail Modal ─────────────────────────────── */}
      <Dialog
        open={!!selectedResource}
        onOpenChange={(open) => {
          if (!open) setSelectedResource(null);
        }}
      >
        <DialogContent
          data-ocid="library.resource.dialog"
          className="max-w-[380px] max-h-[80vh] overflow-hidden flex flex-col p-0"
          style={{
            background: "oklch(0.13 0.018 255)",
            border: "1px solid oklch(0.28 0.03 255)",
            boxShadow:
              "0 24px 80px oklch(0 0 0 / 0.7), 0 0 0 1px oklch(0.28 0.03 255)",
          }}
        >
          {selectedResource && (
            <>
              {/* Modal header */}
              <DialogHeader
                className="px-4 pt-4 pb-3 flex-shrink-0"
                style={{ borderBottom: "1px solid oklch(0.22 0.025 255)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <CategoryBadge category={selectedResource.category} />
                      {selectedResource.featured && (
                        <div
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                          style={{
                            background: GOLD_DIM,
                            border: `1px solid ${GOLD_BORDER}`,
                          }}
                        >
                          <Star
                            className="w-2.5 h-2.5"
                            fill={GOLD}
                            style={{ color: GOLD }}
                          />
                          <span
                            className="text-[8px] font-mono-code font-bold uppercase tracking-wider"
                            style={{ color: GOLD }}
                          >
                            FEATURED
                          </span>
                        </div>
                      )}
                    </div>
                    <DialogTitle
                      className="text-sm font-display font-bold leading-snug"
                      style={{
                        color: selectedResource.featured
                          ? GOLD
                          : "oklch(0.92 0.01 255)",
                      }}
                    >
                      {selectedResource.title}
                    </DialogTitle>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock
                        className="w-2.5 h-2.5"
                        style={{ color: "oklch(0.5 0.04 255)" }}
                      />
                      <span
                        className="text-[9px] font-mono-code"
                        style={{ color: "oklch(0.5 0.04 255)" }}
                      >
                        {selectedResource.readMinutes} min read
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    data-ocid="library.resource.close_button"
                    onClick={() => setSelectedResource(null)}
                    className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                    style={{ color: "oklch(0.55 0.04 255)" }}
                    aria-label="Close document"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </DialogHeader>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3">
                {/* Body text */}
                <div className="space-y-3 mb-4">
                  {selectedResource.body
                    .split("\n\n")
                    .filter(Boolean)
                    .map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 40)}
                        className="text-[11px] font-body leading-relaxed"
                        style={{ color: "oklch(0.72 0.03 255)" }}
                      >
                        {paragraph.trim()}
                      </p>
                    ))}
                </div>

                {/* Tags */}
                <div
                  className="pt-3"
                  style={{ borderTop: "1px solid oklch(0.22 0.025 255)" }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Tag
                      className="w-2.5 h-2.5"
                      style={{ color: "oklch(0.5 0.04 255)" }}
                    />
                    <span
                      className="text-[9px] font-mono-code uppercase tracking-wider"
                      style={{ color: "oklch(0.5 0.04 255)" }}
                    >
                      Tags
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedResource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono-code px-2 py-0.5 rounded-full"
                        style={{
                          color: "oklch(0.6 0.06 75)",
                          background: "oklch(0.78 0.12 75 / 0.08)",
                          border: "1px solid oklch(0.78 0.12 75 / 0.2)",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div
                className="px-4 py-3 flex-shrink-0 flex items-center justify-end"
                style={{ borderTop: "1px solid oklch(0.22 0.025 255)" }}
              >
                <Button
                  data-ocid="library.resource.close_button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedResource(null)}
                  className="h-7 px-3 text-[10px] font-mono-code rounded-lg"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
