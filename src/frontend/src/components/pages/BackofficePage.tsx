import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  Building2,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Download,
  FileText,
  Layers,
  OctagonX,
  PiggyBank,
  Radio,
  Save,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import type * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import RegulatoryComplianceTranslator from "../RegulatoryComplianceTranslator";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}
function Section({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="mx-3 mt-3 rounded-xl overflow-hidden"
      style={{
        border: "1px solid oklch(0.26 0.03 255)",
        background: "oklch(0.14 0.02 255)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-navy-raised transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span
            className="text-xs font-display font-bold"
            style={{ color: "oklch(0.82 0.06 255)" }}
          >
            {title}
          </span>
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div
          className="border-t"
          style={{ borderColor: "oklch(0.22 0.025 255)" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

const USERS = [
  {
    id: "u1",
    name: "NWOS Administrator",
    principal: "rdmx6-jaaaa-aaaaa-aaadq-cai",
    role: "admin",
  },
  {
    id: "u2",
    name: "Sovereign Analyst",
    principal: "rno2w-sqaaa-aaaaa-aaacq-cai",
    role: "user",
  },
  {
    id: "u3",
    name: "GOI Liaison Officer",
    principal: "qaa6y-5yaaa-aaaaa-aaafa-cai",
    role: "user",
  },
  {
    id: "u4",
    name: "Security Auditor",
    principal: "6g3jj-3h777-aaaaa-aaaba-cai",
    role: "guest",
  },
];

const SENSOR_LOG = [
  { ts: "03:14:22", event: "Bio-sensor reading: HR=72, BP=120/78, SpO2=98%" },
  { ts: "03:13:55", event: "Digital Smile: GENERIC behavior confirmed" },
  { ts: "03:13:40", event: "Vault unlock: PIN 262626 verified" },
  { ts: "03:13:12", event: "6G URLLC slice: 0.42ms latency" },
  { ts: "03:12:58", event: "Self-healing: MOIRA_CORE status READY" },
  { ts: "03:12:45", event: "Device Trust: e-M-Sim IGNITED" },
];

const TX_LOG = [
  {
    id: "TX001",
    desc: "Monthly Salary",
    amount: 48250,
    date: "Mar 1",
    type: "credit",
  },
  {
    id: "TX002",
    desc: "Grocery Shopping",
    amount: 12800,
    date: "Mar 3",
    type: "debit",
  },
  {
    id: "TX003",
    desc: "Electricity Bill",
    amount: 4500,
    date: "Mar 5",
    type: "debit",
  },
  {
    id: "TX004",
    desc: "Metro Pass",
    amount: 8900,
    date: "Mar 7",
    type: "debit",
  },
  {
    id: "TX005",
    desc: "Freelance Payment",
    amount: 25000,
    date: "Mar 9",
    type: "credit",
  },
];

const MANIFEST = {
  project: "MOIRA NWOS",
  version: "20.0.0",
  build_date: new Date().toISOString().slice(0, 10),
  architecture: "Decentralized Canister (ICP)",
  stack: ["Internet Computer Protocol", "Motoko", "React 19", "TypeScript"],
  sovereign_classification: "NATIONAL_ESSENTIAL_UTILITY",
  ip_owner: "P.S. Thimaia",
  license: "CC BY-NC-ND",
  make_in_india: true,
  goi_registration: "MII-NWOS-2024-001",
  security_standard: "262626-SAFE-BANKING",
  quantum_algorithms: ["CRYSTALS-Kyber", "SPHINCS+", "DILITHIUM"],
  network: "6G-READY",
  nodes: ["IN-NORTH", "IN-SOUTH", "US-EAST", "US-WEST"],
  wealth_pools: { india: "$3T @ 4.2% p.a.", usa: "$30T @ 5.8% p.a." },
  properties_tokenized: 100000,
  copyright: "Copyright © P.S. Thimaia. All rights reserved.",
};

interface Props {
  inactionActive?: boolean;
}

export default function BackofficePage({ inactionActive = false }: Props) {
  const [users, setUsers] = useState(USERS);
  const [budgets, setBudgets] = useState({
    Food: 15000,
    Transport: 10000,
    Bills: 6000,
    Entertainment: 5000,
    Shopping: 8000,
  });
  const [showManifest, setShowManifest] = useState(false);
  const [manifestJson, setManifestJson] = useState("");

  const promoteUser = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, role: u.role === "admin" ? "user" : "admin" } : u,
      ),
    );
    toast.success("Role updated");
  };

  const generateManifest = () => {
    const json = JSON.stringify(MANIFEST, null, 2);
    setManifestJson(json);
    setShowManifest(true);
    toast.success("GOI Manifest generated");
  };

  const downloadManifest = () => {
    window.print();
    toast("Opening print dialog for GOI submission");
  };

  return (
    <div className="pb-4 relative">
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

      <div
        className="px-3 py-3 border-b"
        style={{ borderColor: "oklch(0.22 0.025 255)" }}
      >
        <div className="flex items-center gap-2">
          <Building2
            className="w-5 h-5"
            style={{ color: "oklch(0.78 0.12 75)" }}
          />
          <div>
            <p
              className="text-sm font-display font-bold"
              style={{ color: "oklch(0.88 0.08 75)" }}
            >
              NWOS Backoffice
            </p>
            <p className="text-[10px] font-body text-muted-foreground">
              Admin — MOIRA National Wealth OS
            </p>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <Section
        title="Financial Overview"
        icon={
          <BarChart3
            className="w-4 h-4"
            style={{ color: "oklch(0.78 0.12 75)" }}
          />
        }
      >
        <div className="grid grid-cols-3 gap-0">
          {[
            {
              label: "Total Assets",
              value: formatINR(14070000),
              icon: TrendingUp,
              color: "oklch(0.65 0.16 150)",
            },
            {
              label: "Liabilities",
              value: formatINR(2850000),
              icon: TrendingDown,
              color: "oklch(0.65 0.22 15)",
            },
            {
              label: "Net Worth",
              value: formatINR(11220000),
              icon: PiggyBank,
              color: "oklch(0.78 0.12 75)",
            },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <div
              key={label}
              className={`px-3 py-3 text-center ${i < 2 ? "border-r" : ""}`}
              style={{ borderColor: "oklch(0.22 0.025 255)" }}
            >
              <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
              <p className="text-xs font-display font-bold" style={{ color }}>
                {value}
              </p>
              <p className="text-[9px] font-body text-muted-foreground mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* User Management */}
      <Section
        title="User Management"
        icon={
          <Users className="w-4 h-4" style={{ color: "oklch(0.6 0.18 200)" }} />
        }
      >
        <div
          className="divide-y"
          style={{ borderColor: "oklch(0.22 0.025 255)" }}
        >
          {users.map((u, i) => (
            <div
              key={u.id}
              data-ocid={`admin.user.item.${i + 1}`}
              className="flex items-center justify-between px-3 py-2.5"
            >
              <div>
                <p className="text-xs font-body font-medium text-foreground">
                  {u.name}
                </p>
                <p className="text-[9px] font-mono-code text-muted-foreground">
                  {u.principal.slice(0, 18)}…
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  style={{
                    background:
                      u.role === "admin"
                        ? "oklch(0.78 0.12 75 / 0.15)"
                        : "oklch(0.22 0.03 255)",
                    border: `1px solid ${u.role === "admin" ? "oklch(0.55 0.1 75 / 0.5)" : "oklch(0.3 0.03 255)"}`,
                    color:
                      u.role === "admin"
                        ? "oklch(0.88 0.1 75)"
                        : "oklch(0.6 0.04 255)",
                    fontSize: "9px",
                  }}
                >
                  {u.role}
                </Badge>
                <Button
                  data-ocid={`admin.user.edit_button.${i + 1}`}
                  size="sm"
                  variant="outline"
                  onClick={() => promoteUser(u.id)}
                  disabled={inactionActive}
                  className="h-6 text-[9px] px-2 disabled:opacity-40"
                >
                  {u.role === "admin" ? "Demote" : "Promote"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Transaction Audit */}
      <Section
        title="Transaction Audit Log"
        icon={
          <Layers
            className="w-4 h-4"
            style={{ color: "oklch(0.6 0.18 200)" }}
          />
        }
      >
        <div
          className="divide-y"
          style={{ borderColor: "oklch(0.22 0.025 255)" }}
        >
          {TX_LOG.map((tx, i) => (
            <div
              key={tx.id}
              data-ocid={`admin.tx.item.${i + 1}`}
              className="flex items-center justify-between px-3 py-2"
            >
              <div>
                <p className="text-[10px] font-body font-medium text-foreground">
                  {tx.desc}
                </p>
                <p className="text-[9px] font-mono-code text-muted-foreground">
                  {tx.id} · {tx.date}
                </p>
              </div>
              <p
                className="text-xs font-mono-code font-semibold"
                style={{
                  color:
                    tx.type === "credit"
                      ? "oklch(0.65 0.16 150)"
                      : "oklch(0.65 0.22 15)",
                }}
              >
                {tx.type === "credit" ? "+" : "-"}
                {formatINR(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Budget Control */}
      <Section
        title="Budget Control"
        icon={
          <DollarSign
            className="w-4 h-4"
            style={{ color: "oklch(0.78 0.12 75)" }}
          />
        }
      >
        <div className="p-3 space-y-2">
          {Object.entries(budgets).map(([cat, val]) => (
            <div key={cat} className="flex items-center gap-2">
              <span className="text-[10px] font-body text-foreground/80 w-24 flex-shrink-0">
                {cat}
              </span>
              <Input
                data-ocid="admin.budget.input"
                type="number"
                value={val}
                onChange={(e) =>
                  setBudgets((p) => ({ ...p, [cat]: Number(e.target.value) }))
                }
                disabled={inactionActive}
                className="flex-1 h-7 text-xs bg-navy-raised border-border text-foreground disabled:opacity-40"
              />
              <span className="text-[9px] font-mono-code text-muted-foreground flex-shrink-0">
                /mo
              </span>
            </div>
          ))}
          <Button
            data-ocid="admin.budget.save_button"
            size="sm"
            disabled={inactionActive}
            onClick={() => toast.success("Budgets saved")}
            className="w-full mt-2 h-7 text-xs disabled:opacity-40"
            style={{
              background: "oklch(0.22 0.04 75)",
              color: "oklch(0.88 0.1 75)",
            }}
          >
            <Save className="w-3 h-3 mr-1" /> Save Budgets
          </Button>
        </div>
      </Section>

      {/* Sensor Log */}
      <Section
        title="Sensor Log"
        icon={
          <Radio
            className="w-4 h-4"
            style={{ color: "oklch(0.65 0.16 150)" }}
          />
        }
      >
        <div
          className="divide-y"
          style={{ borderColor: "oklch(0.18 0.02 255)" }}
        >
          {SENSOR_LOG.map((ev) => (
            <div key={ev.ts} className="flex items-start gap-2 px-3 py-1.5">
              <span
                className="text-[9px] font-mono-code flex-shrink-0"
                style={{ color: "oklch(0.65 0.16 150)" }}
              >
                {ev.ts}
              </span>
              <p
                className="text-[9px] font-mono-code"
                style={{ color: "oklch(0.65 0.04 255)" }}
              >
                {ev.event}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Make in India Export Module */}
      <div
        className="mx-3 mt-3 rounded-xl overflow-hidden"
        style={{
          border: "1px solid oklch(0.55 0.16 145 / 0.4)",
          background: "oklch(0.11 0.015 255)",
        }}
      >
        <div
          className="px-3 py-2.5 border-b"
          style={{
            borderColor: "oklch(0.28 0.04 145 / 0.4)",
            background: "oklch(0.13 0.02 255)",
          }}
        >
          <div className="flex items-center gap-2">
            <FileText
              className="w-4 h-4"
              style={{ color: "oklch(0.55 0.16 145)" }}
            />
            <p
              className="text-xs font-display font-bold"
              style={{ color: "oklch(0.75 0.12 145)" }}
            >
              Make in India Export Module
            </p>
          </div>
          <p
            className="text-[9px] font-body mt-0.5"
            style={{ color: "oklch(0.5 0.06 255)" }}
          >
            MOIRA NWOS — GOI Project Manifest Generator
          </p>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { label: "Project", value: "MOIRA NWOS" },
              { label: "Version", value: "20.0.0" },
              { label: "Architecture", value: "ICP / Motoko" },
              { label: "IP Owner", value: "P.S. Thimaia" },
              { label: "License", value: "CC BY-NC-ND" },
              { label: "Classification", value: "SOVEREIGN" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-lg px-2.5 py-2"
                style={{
                  background: "oklch(0.16 0.022 255)",
                  border: "1px solid oklch(0.24 0.028 255)",
                }}
              >
                <p
                  className="text-[9px] font-body"
                  style={{ color: "oklch(0.45 0.04 255)" }}
                >
                  {label}
                </p>
                <p
                  className="text-[10px] font-mono-code font-bold"
                  style={{ color: "oklch(0.78 0.06 255)" }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              data-ocid="admin.generate_manifest.primary_button"
              onClick={generateManifest}
              disabled={inactionActive}
              className="flex-1 h-8 text-xs font-display font-semibold disabled:opacity-40"
              style={{
                background: "oklch(0.55 0.16 145 / 0.2)",
                border: "1px solid oklch(0.55 0.16 145 / 0.5)",
                color: "oklch(0.72 0.14 145)",
              }}
            >
              <Shield className="w-3 h-3 mr-1" /> Generate GOI Manifest
            </Button>
            <Button
              data-ocid="admin.download_manifest.primary_button"
              onClick={downloadManifest}
              disabled={inactionActive}
              className="flex-1 h-8 text-xs font-display font-semibold disabled:opacity-40"
              style={{
                background: "oklch(0.22 0.04 75 / 0.3)",
                border: "1px solid oklch(0.45 0.08 75 / 0.4)",
                color: "oklch(0.82 0.1 75)",
              }}
            >
              <Download className="w-3 h-3 mr-1" /> Download for GOI
            </Button>
          </div>

          {showManifest && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 rounded-lg overflow-hidden"
              style={{
                background: "oklch(0.08 0.01 150)",
                border: "1px solid oklch(0.25 0.04 145 / 0.5)",
              }}
            >
              <div
                className="flex items-center justify-between px-3 py-1.5 border-b"
                style={{ borderColor: "oklch(0.18 0.03 145 / 0.4)" }}
              >
                <span
                  className="text-[9px] font-mono-code"
                  style={{ color: "oklch(0.65 0.16 145)" }}
                >
                  GOI_MANIFEST.json
                </span>
                <button
                  type="button"
                  data-ocid="admin.manifest.close_button"
                  onClick={() => setShowManifest(false)}
                  className="text-[10px]"
                  style={{ color: "oklch(0.45 0.04 255)" }}
                >
                  ×
                </button>
              </div>
              <ScrollArea className="max-h-40">
                <pre
                  className="px-3 py-2 text-[8px] font-mono-code leading-relaxed"
                  style={{ color: "oklch(0.65 0.14 145)" }}
                >
                  {manifestJson}
                </pre>
              </ScrollArea>
            </motion.div>
          )}
        </div>
      </div>

      {/* ════ SENATE / PARLIAMENTARY BOARD AUDIT MODULE ════ */}
      <div
        className="mx-3 mt-3 rounded-xl overflow-hidden"
        style={{
          border: "1px solid oklch(0.72 0.16 55 / 0.45)",
          background: "oklch(0.10 0.015 55 / 0.25)",
        }}
      >
        <div
          className="flex items-center justify-between px-3 py-2.5 border-b"
          style={{ borderColor: "oklch(0.22 0.025 255)" }}
        >
          <div className="flex items-center gap-2">
            <Shield
              className="w-4 h-4"
              style={{ color: "oklch(0.72 0.16 55)" }}
            />
            <div>
              <p
                className="text-xs font-display font-bold"
                style={{ color: "oklch(0.82 0.12 55)" }}
              >
                SENATE / PARLIAMENTARY BOARD AUDIT MODULE
              </p>
              <p
                className="text-[9px] font-mono-code"
                style={{ color: "oklch(0.55 0.08 55)" }}
              >
                CLASSIFIED — GOVERNANCE RECORD — READ ONLY
              </p>
            </div>
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
        {/* Compliance badges */}
        <div className="flex flex-wrap gap-2 px-3 pt-3">
          {[
            "ITSA CERTIFIED",
            "GOI COMPLIANT",
            "KYC VERIFIED",
            "SAFE BANKING",
          ].map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono-code font-bold"
              style={{
                background: "oklch(0.65 0.16 150 / 0.1)",
                border: "1px solid oklch(0.65 0.16 150 / 0.3)",
                color: "oklch(0.65 0.16 150)",
              }}
            >
              <Shield className="w-2.5 h-2.5" /> {badge}
            </span>
          ))}
        </div>
        {/* Audit log table */}
        <div className="overflow-x-auto px-3 mt-3">
          <table className="w-full text-[9px]">
            <thead>
              <tr style={{ borderBottom: "1px solid oklch(0.22 0.025 255)" }}>
                {["Timestamp", "Module", "Event", "Compliance", "Governor"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-2 py-2 text-left font-mono-code font-semibold"
                      style={{ color: "oklch(0.5 0.04 255)" }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  ts: "2026-03-11 03:14:22",
                  module: "VAULT",
                  event: "Vault access authorized — PIN 262626 verified",
                  compliance: "PASS",
                  governor: "SENATE-NODE-01",
                },
                {
                  ts: "2026-03-11 03:12:05",
                  module: "GOI",
                  event: "Property NWOS-000421 settlement approved ₹2.8Cr",
                  compliance: "PASS",
                  governor: "PARL-BOARD-03",
                },
                {
                  ts: "2026-03-11 03:10:44",
                  module: "VAULT",
                  event: "Quantum key rotation — CRYSTALS-Kyber",
                  compliance: "PASS",
                  governor: "GOI-AUDIT-07",
                },
                {
                  ts: "2026-03-11 03:08:31",
                  module: "BRAIN",
                  event: "SDK slot IoT-AGRI-NODE-001 registered",
                  compliance: "PASS",
                  governor: "SENATE-NODE-01",
                },
                {
                  ts: "2026-03-11 03:06:18",
                  module: "BRAIN",
                  event: "Cold-start recovery test completed 44.8s",
                  compliance: "PASS",
                  governor: "PARL-BOARD-03",
                },
                {
                  ts: "2026-03-11 03:04:02",
                  module: "6G",
                  event: "Sovereign Lane partition activated — URLLC",
                  compliance: "PASS",
                  governor: "GOI-AUDIT-07",
                },
                {
                  ts: "2026-03-11 03:01:55",
                  module: "ADMIN",
                  event: "262626 self-healing audit — all nodes GREEN",
                  compliance: "PASS",
                  governor: "SENATE-NODE-01",
                },
                {
                  ts: "2026-03-11 02:58:40",
                  module: "SENSORS",
                  event: "Bio-sovereign handshake — identity confirmed",
                  compliance: "PASS",
                  governor: "PARL-BOARD-03",
                },
              ].map((row, i) => (
                <tr
                  key={row.ts}
                  data-ocid={`admin.audit.row.${i + 1}`}
                  style={{ borderBottom: "1px solid oklch(0.18 0.02 255)" }}
                >
                  <td
                    className="px-2 py-2 font-mono-code"
                    style={{
                      color: "oklch(0.5 0.04 255)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.ts}
                  </td>
                  <td className="px-2 py-2">
                    <span
                      className="px-1.5 py-0.5 rounded font-mono-code font-bold"
                      style={{
                        background: "oklch(0.6 0.18 200 / 0.1)",
                        color: "oklch(0.6 0.18 200)",
                      }}
                    >
                      {row.module}
                    </span>
                  </td>
                  <td
                    className="px-2 py-2 font-body max-w-[160px] truncate"
                    style={{ color: "oklch(0.78 0.04 255)" }}
                    title={row.event}
                  >
                    {row.event}
                  </td>
                  <td className="px-2 py-2">
                    <span
                      className="font-mono-code font-bold"
                      style={{ color: "oklch(0.65 0.16 150)" }}
                    >
                      {row.compliance}
                    </span>
                  </td>
                  <td
                    className="px-2 py-2 font-mono-code"
                    style={{
                      color: "oklch(0.72 0.16 55)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.governor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Write-protected note */}
        <div
          className="px-3 py-2 mt-1"
          style={{ borderTop: "1px solid oklch(0.22 0.025 255)" }}
        >
          <p
            className="text-[8px] font-mono-code"
            style={{ color: "oklch(0.45 0.04 255)" }}
          >
            ⚠ This module is write-protected. Governance records are immutable
            on-chain.
          </p>
        </div>
        {/* Export button */}
        <div className="px-3 pb-3">
          <button
            type="button"
            data-ocid="admin.senate_export.primary_button"
            onClick={() => window.print()}
            className="w-full h-8 text-xs font-display font-semibold rounded-lg mt-2 flex items-center justify-center gap-2"
            style={{
              background: "oklch(0.72 0.16 55 / 0.15)",
              border: "1px solid oklch(0.72 0.16 55 / 0.4)",
              color: "oklch(0.82 0.12 55)",
            }}
          >
            <Shield className="w-3 h-3" /> Export Senate Briefing
          </button>
        </div>
      </div>

      <RegulatoryComplianceTranslator />

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
