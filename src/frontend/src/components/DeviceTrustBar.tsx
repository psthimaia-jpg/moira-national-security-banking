import { ChevronDown, ChevronUp, Cpu, Fingerprint, Info } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────
type ESimTrust = "IGNITED" | "RESTRICTED";

interface DeviceTrustBarProps {
  eSimTrust: ESimTrust;
  onToggle: () => void;
  inactionActive: boolean;
}

// ── Color map ─────────────────────────────────────────────────
const TRUST_COLORS = {
  IGNITED: {
    bg: "oklch(0.13 0.025 150 / 0.4)",
    border: "oklch(0.45 0.14 150 / 0.35)",
    text: "oklch(0.75 0.17 150)",
    dot: "oklch(0.7 0.17 150)",
    accent: "oklch(0.65 0.16 150)",
  },
  RESTRICTED: {
    bg: "oklch(0.13 0.025 18 / 0.6)",
    border: "oklch(0.55 0.2 18 / 0.5)",
    text: "oklch(0.75 0.18 18)",
    dot: "oklch(0.75 0.18 18)",
    accent: "oklch(0.65 0.22 15)",
  },
} as const;

// ── Main Component ─────────────────────────────────────────────
export default function DeviceTrustBar({
  eSimTrust,
  onToggle,
  inactionActive,
}: DeviceTrustBarProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = TRUST_COLORS[eSimTrust];
  const isRestricted = eSimTrust === "RESTRICTED";

  return (
    <div
      data-ocid="device_trust.bar"
      className="border-b transition-all duration-300"
      style={{
        background: isRestricted ? "oklch(0.12 0.03 18 / 0.8)" : colors.bg,
        borderColor: colors.border,
      }}
    >
      {/* ── Compact strip ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-1.5">
        {/* Left: icon + label + status badge */}
        <div className="flex items-center gap-2 min-w-0">
          <Fingerprint
            className="w-3 h-3 flex-shrink-0"
            style={{ color: colors.text }}
          />
          <span
            className="text-[9px] font-mono-code font-bold tracking-widest uppercase flex-shrink-0"
            style={{ color: colors.text }}
          >
            e-M-Sim TRUST
          </span>

          {/* Status badge */}
          <motion.div
            data-ocid="device_trust.status.badge"
            animate={isRestricted ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: `${colors.dot} / 0.15`.replace(
                /oklch\((.+?)\) \/ ([\d.]+)/,
                "oklch($1 / $2)",
              ),
              border: `1px solid ${colors.dot.replace(")", " / 0.35)")}`,
            }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: colors.dot,
                boxShadow: isRestricted ? `0 0 6px ${colors.dot}` : "none",
              }}
              animate={isRestricted ? { opacity: [1, 0.3, 1] } : {}}
              transition={{ duration: 1.0, repeat: Number.POSITIVE_INFINITY }}
            />
            <span
              className="text-[8px] font-mono-code font-bold tracking-widest"
              style={{ color: colors.text }}
            >
              {eSimTrust}
            </span>
          </motion.div>

          {/* Restricted warning */}
          {isRestricted && (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 0.7, repeat: Number.POSITIVE_INFINITY }}
              className="text-[8px] font-mono-code font-bold tracking-widest uppercase flex-shrink-0"
              style={{ color: "oklch(0.75 0.18 18)" }}
            >
              VAULT+6G HIDDEN
            </motion.span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle button */}
          <button
            type="button"
            onClick={onToggle}
            disabled={inactionActive}
            className="px-1.5 py-0.5 rounded text-[8px] font-mono-code font-bold transition-colors disabled:opacity-40 flex-shrink-0"
            style={{
              background: isRestricted
                ? "oklch(0.65 0.22 15 / 0.15)"
                : "oklch(0.65 0.16 150 / 0.15)",
              border: `1px solid ${colors.dot.replace(")", " / 0.4)")}`,
              color: colors.text,
            }}
          >
            {isRestricted ? "SET IGNITED" : "SET RESTRICTED"}
          </button>

          {/* Expand chevron */}
          <button
            type="button"
            data-ocid="device_trust.toggle"
            onClick={() => setExpanded((v) => !v)}
            className="w-5 h-5 flex items-center justify-center rounded flex-shrink-0 hover:bg-white/5 transition-colors"
            aria-label={
              expanded ? "Collapse device trust" : "Expand device trust"
            }
          >
            {expanded ? (
              <ChevronUp className="w-3 h-3" style={{ color: colors.text }} />
            ) : (
              <ChevronDown className="w-3 h-3" style={{ color: colors.text }} />
            )}
          </button>
        </div>
      </div>

      {/* ── Expanded view ──────────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 space-y-2">
              {/* Status detail row */}
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="rounded-lg p-2"
                  style={{
                    background: "oklch(0.10 0.015 255)",
                    border: `1px solid ${colors.dot.replace(")", " / 0.25)")}`,
                  }}
                >
                  <div
                    className="text-[8px] font-mono-code tracking-widest uppercase mb-1"
                    style={{ color: "oklch(0.45 0.04 255)" }}
                  >
                    Device Trust
                  </div>
                  <div
                    className="text-[11px] font-mono-code font-bold"
                    style={{ color: colors.accent }}
                  >
                    {eSimTrust}
                  </div>
                </div>
                <div
                  className="rounded-lg p-2"
                  style={{
                    background: "oklch(0.10 0.015 255)",
                    border: "1px solid oklch(0.25 0.03 255)",
                  }}
                >
                  <div
                    className="text-[8px] font-mono-code tracking-widest uppercase mb-1"
                    style={{ color: "oklch(0.45 0.04 255)" }}
                  >
                    eSIM Profile
                  </div>
                  <div
                    className="text-[11px] font-mono-code font-bold"
                    style={{
                      color:
                        eSimTrust === "IGNITED"
                          ? "oklch(0.65 0.16 150)"
                          : "oklch(0.55 0.04 255)",
                    }}
                  >
                    {eSimTrust === "IGNITED" ? "ACTIVE" : "INACTIVE"}
                  </div>
                </div>
              </div>

              {/* Restricted mode explanation */}
              {isRestricted && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg px-2.5 py-2 flex items-start gap-2"
                  style={{
                    background: "oklch(0.12 0.03 18 / 0.5)",
                    border: "1px solid oklch(0.62 0.2 18 / 0.3)",
                  }}
                >
                  <Cpu
                    className="w-3 h-3 flex-shrink-0 mt-0.5"
                    style={{ color: "oklch(0.65 0.22 15)" }}
                  />
                  <p
                    className="text-[9px] font-body leading-relaxed"
                    style={{ color: "oklch(0.65 0.12 20)" }}
                  >
                    RESTRICTED mode: Vault and 6G tabs are hidden from
                    navigation. Set to IGNITED to restore full access.
                  </p>
                </motion.div>
              )}

              {/* Demo disclaimer */}
              <div className="flex items-center gap-1.5">
                <Info
                  className="w-2.5 h-2.5 flex-shrink-0"
                  style={{ color: "oklch(0.4 0.04 255)" }}
                />
                <span
                  className="text-[8px] font-mono-code tracking-widest"
                  style={{ color: "oklch(0.38 0.04 255)" }}
                >
                  DEMO — Simulated eSIM Trust Status · Not connected to real
                  hardware
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
