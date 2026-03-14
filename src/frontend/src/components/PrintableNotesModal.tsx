import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Printer, Shield, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface Transaction {
  description: string;
  category: string;
  amount: number;
  transactionType: "credit" | "debit";
  timestamp?: bigint;
}

interface PrintableNotesModalProps {
  open: boolean;
  onClose: () => void;
  accountHolder?: string;
  accountNumber?: string;
  balance?: number;
  bankModeActive?: boolean;
  vaultLocked?: boolean;
  recentTransactions?: Transaction[];
}

function formatDate(timestamp?: bigint): string {
  if (!timestamp) return "—";
  const ms = Number(timestamp / BigInt(1_000_000));
  if (ms === 0 || Number.isNaN(ms)) return "Recently";
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    description: "Monthly Salary Credit",
    category: "Salary",
    amount: 185000.0,
    transactionType: "credit",
    timestamp: BigInt(Date.now() - 2 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
  },
  {
    description: "BBMP Property Tax",
    category: "Bills",
    amount: 4250.0,
    transactionType: "debit",
    timestamp: BigInt(Date.now() - 4 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
  },
  {
    description: "Freelance UX Project",
    category: "Salary",
    amount: 55000.0,
    transactionType: "credit",
    timestamp: BigInt(Date.now() - 6 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
  },
  {
    description: "BigBasket Groceries",
    category: "Food",
    amount: 3890.0,
    transactionType: "debit",
    timestamp: BigInt(Date.now() - 7 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
  },
  {
    description: "Bengaluru Metro Pass",
    category: "Transport",
    amount: 1200.0,
    transactionType: "debit",
    timestamp: BigInt(Date.now() - 9 * 24 * 60 * 60 * 1000) * BigInt(1_000_000),
  },
];

export default function PrintableNotesModal({
  open,
  onClose,
  accountHolder = "P.S. Thimaia",
  accountNumber = "MOIRA-2626-XXXX",
  balance = 2468500.0,
  bankModeActive = true,
  vaultLocked = true,
  recentTransactions,
}: PrintableNotesModalProps) {
  const [remarks, setRemarks] = useState("");
  const txns =
    recentTransactions && recentTransactions.length > 0
      ? recentTransactions.slice(0, 5)
      : MOCK_TRANSACTIONS;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Inject supplementary print styles (index.css @media print handles main hiding)
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "moira-print-styles-modal";
    style.textContent = `
      @media print {
        #moira-printable-note .print-hide { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById("moira-print-styles-modal");
      if (el) el.remove();
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            background: "oklch(0 0 0 / 0.7)",
            backdropFilter: "blur(6px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          data-ocid="print_note.modal"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl scrollbar-hide"
            style={{
              background: "oklch(0.15 0.022 255)",
              border: "1px solid oklch(0.28 0.035 255)",
              boxShadow:
                "0 32px 64px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(0.78 0.12 75 / 0.15)",
            }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b sticky top-0 z-10"
              style={{
                background: "oklch(0.13 0.018 255)",
                borderColor: "oklch(0.25 0.03 255)",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: "oklch(0.78 0.12 75 / 0.15)",
                    border: "1px solid oklch(0.78 0.12 75 / 0.3)",
                  }}
                >
                  <Printer className="w-3.5 h-3.5 text-gold" />
                </div>
                <div>
                  <p className="text-xs font-display font-bold text-foreground leading-tight">
                    Printable Note
                  </p>
                  <p
                    className="text-[9px] font-mono-code"
                    style={{ color: "oklch(0.55 0.06 255)" }}
                  >
                    Official Account Reference
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-ocid="print_note.close_button"
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-navy-raised transition-colors"
                aria-label="Close printable note"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Printable content ─────────────────── */}
            <div id="moira-printable-note" className="p-4">
              {/* Note header */}
              <div
                className="rounded-xl p-4 mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.18 0.03 255) 0%, oklch(0.14 0.022 255) 100%)",
                  border: "1px solid oklch(0.32 0.04 255)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-gold" />
                      <p className="font-display font-bold text-sm text-foreground">
                        MOIRA SmartBank AI
                      </p>
                    </div>
                    <p
                      className="text-xs font-display font-semibold"
                      style={{ color: "oklch(0.78 0.12 75)" }}
                    >
                      Official Account Note
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-[9px] font-mono-code"
                      style={{ color: "oklch(0.55 0.06 255)" }}
                    >
                      Generated
                    </p>
                    <p className="text-[9px] font-mono-code text-foreground/70">
                      {dateStr}
                    </p>
                    <p
                      className="text-[9px] font-mono-code"
                      style={{ color: "oklch(0.55 0.06 255)" }}
                    >
                      {timeStr}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Summary */}
              <div className="mb-4">
                <p
                  className="text-[10px] font-display font-bold uppercase tracking-widest mb-2"
                  style={{ color: "oklch(0.55 0.06 255)" }}
                >
                  Account Summary
                </p>
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "oklch(0.17 0.025 255)",
                    border: "1px solid oklch(0.28 0.032 255)",
                  }}
                >
                  {[
                    { label: "Account Holder", value: accountHolder },
                    {
                      label: "Account Number",
                      value: accountNumber,
                      mono: true,
                    },
                    {
                      label: "Current Balance",
                      value: `₹${balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                      mono: true,
                      highlight: true,
                    },
                    {
                      label: "Bank Mode Status",
                      value: bankModeActive
                        ? "ACTIVE — Secure session live"
                        : "INACTIVE",
                      badge: bankModeActive ? "active" : "inactive",
                    },
                    {
                      label: "Vault Status",
                      value: vaultLocked ? "LOCKED" : "UNLOCKED",
                      badge: vaultLocked ? "locked" : "unlocked",
                    },
                  ].map(({ label, value, mono, highlight, badge }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between px-3 py-2.5 border-b last:border-0"
                      style={{ borderColor: "oklch(0.24 0.028 255)" }}
                    >
                      <span
                        className="text-[10px] font-body"
                        style={{ color: "oklch(0.55 0.05 255)" }}
                      >
                        {label}
                      </span>
                      {badge ? (
                        <span
                          className="text-[9px] font-mono-code font-bold px-1.5 py-0.5 rounded-full"
                          style={{
                            background:
                              badge === "active"
                                ? "oklch(0.62 0.18 150 / 0.15)"
                                : badge === "locked"
                                  ? "oklch(0.62 0.2 18 / 0.15)"
                                  : badge === "unlocked"
                                    ? "oklch(0.62 0.18 200 / 0.15)"
                                    : "oklch(0.28 0.03 255 / 0.4)",
                            color:
                              badge === "active"
                                ? "oklch(0.75 0.17 150)"
                                : badge === "locked"
                                  ? "oklch(0.75 0.18 18)"
                                  : badge === "unlocked"
                                    ? "oklch(0.75 0.15 200)"
                                    : "oklch(0.5 0.04 255)",
                            border: `1px solid ${
                              badge === "active"
                                ? "oklch(0.62 0.18 150 / 0.3)"
                                : badge === "locked"
                                  ? "oklch(0.62 0.2 18 / 0.3)"
                                  : badge === "unlocked"
                                    ? "oklch(0.62 0.18 200 / 0.3)"
                                    : "oklch(0.28 0.03 255)"
                            }`,
                          }}
                        >
                          {value}
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] ${
                            mono ? "font-mono-code" : "font-body"
                          } font-medium`}
                          style={{
                            color: highlight
                              ? "oklch(0.78 0.12 75)"
                              : "oklch(0.88 0.02 255)",
                          }}
                        >
                          {value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions Table */}
              <div className="mb-4">
                <p
                  className="text-[10px] font-display font-bold uppercase tracking-widest mb-2"
                  style={{ color: "oklch(0.55 0.06 255)" }}
                >
                  Recent Transactions
                </p>
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "oklch(0.17 0.025 255)",
                    border: "1px solid oklch(0.28 0.032 255)",
                  }}
                >
                  {/* Table header */}
                  <div
                    className="flex items-center px-3 py-2 border-b"
                    style={{
                      background: "oklch(0.2 0.028 255)",
                      borderColor: "oklch(0.28 0.032 255)",
                    }}
                  >
                    <span
                      className="text-[9px] font-mono-code font-bold uppercase tracking-widest w-[40%]"
                      style={{ color: "oklch(0.55 0.06 255)" }}
                    >
                      Description
                    </span>
                    <span
                      className="text-[9px] font-mono-code font-bold uppercase tracking-widest w-[20%]"
                      style={{ color: "oklch(0.55 0.06 255)" }}
                    >
                      Category
                    </span>
                    <span
                      className="text-[9px] font-mono-code font-bold uppercase tracking-widest w-[20%] text-right"
                      style={{ color: "oklch(0.55 0.06 255)" }}
                    >
                      Date
                    </span>
                    <span
                      className="text-[9px] font-mono-code font-bold uppercase tracking-widest w-[20%] text-right"
                      style={{ color: "oklch(0.55 0.06 255)" }}
                    >
                      Amount
                    </span>
                  </div>

                  {txns.map((tx, i) => (
                    <div
                      key={`${tx.description}-${i}`}
                      data-ocid={`print_note.transaction.item.${i + 1}`}
                      className="flex items-center px-3 py-2.5 border-b last:border-0"
                      style={{ borderColor: "oklch(0.22 0.025 255)" }}
                    >
                      <span
                        className="text-[9px] font-body w-[40%] truncate pr-2"
                        style={{ color: "oklch(0.82 0.02 255)" }}
                      >
                        {tx.description}
                      </span>
                      <span
                        className="text-[9px] font-body w-[20%]"
                        style={{ color: "oklch(0.55 0.06 255)" }}
                      >
                        {tx.category}
                      </span>
                      <span
                        className="text-[9px] font-mono-code w-[20%] text-right"
                        style={{ color: "oklch(0.55 0.06 255)" }}
                      >
                        {formatDate(tx.timestamp)}
                      </span>
                      <span
                        className="text-[9px] font-mono-code font-semibold w-[20%] text-right"
                        style={{
                          color:
                            tx.transactionType === "credit"
                              ? "oklch(0.7 0.17 150)"
                              : "oklch(0.7 0.18 18)",
                        }}
                      >
                        {tx.transactionType === "credit" ? "+" : "-"}₹
                        {tx.amount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reference / Remarks */}
              <div className="mb-4">
                <label
                  htmlFor="print-remarks"
                  className="block text-[10px] font-display font-bold uppercase tracking-widest mb-2"
                  style={{ color: "oklch(0.55 0.06 255)" }}
                >
                  Reference / Remarks
                </label>
                <Textarea
                  id="print-remarks"
                  data-ocid="print_note.textarea"
                  placeholder="Type your reference note or remarks here... This text will appear on the printed document."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="min-h-[80px] text-xs font-body resize-none"
                  style={{
                    background: "oklch(0.17 0.025 255)",
                    border: "1px solid oklch(0.32 0.04 255)",
                    color: "oklch(0.88 0.02 255)",
                  }}
                />
              </div>

              {/* Security footer */}
              <div
                className="rounded-xl px-3 py-3"
                style={{
                  background: "oklch(0.13 0.02 255)",
                  border: "1px solid oklch(0.24 0.03 255)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-gold" />
                    <span
                      className="text-[9px] font-mono-code font-bold"
                      style={{ color: "oklch(0.78 0.12 75)" }}
                    >
                      Secured by 26.ai
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[8px] font-mono-code border-gold/30 text-gold bg-gold/10 px-1.5 py-0"
                  >
                    VERIFIED
                  </Badge>
                </div>
                <div className="space-y-0.5">
                  <p
                    className="text-[8px] font-mono-code"
                    style={{ color: "oklch(0.4 0.04 255)" }}
                  >
                    © Copyright P.S. Thimaia · Creative Commons CC BY-NC-ND
                  </p>
                  <p
                    className="text-[8px] font-mono-code"
                    style={{ color: "oklch(0.4 0.04 255)" }}
                  >
                    MOIRA Labs · moira.smartbank.ai
                  </p>
                  <p
                    className="text-[8px] font-mono-code"
                    style={{ color: "oklch(0.35 0.03 255)" }}
                  >
                    Ref: MOIRA-{now.getFullYear()}-
                    {String(now.getMonth() + 1).padStart(2, "0")}-
                    {String(now.getDate()).padStart(2, "0")}-
                    {Math.floor(Math.random() * 90000 + 10000)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div
              className="flex gap-2 px-4 pb-4 print-hide"
              style={{ background: "oklch(0.15 0.022 255)" }}
            >
              <Button
                variant="outline"
                size="sm"
                data-ocid="print_note.cancel_button"
                onClick={onClose}
                className="flex-1 text-xs font-body border-border text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                data-ocid="print_note.submit_button"
                onClick={handlePrint}
                className="flex-1 text-xs font-body font-semibold"
                style={{
                  background: "oklch(0.78 0.12 75)",
                  color: "oklch(0.12 0.018 255)",
                  boxShadow: "0 0 12px oklch(0.78 0.12 75 / 0.3)",
                }}
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print Document
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
