import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface Step {
  title: string;
  description: string;
  target: string;
}

const STEPS: Step[] = [
  {
    title: "NWOS Identity — Dashboard",
    target: "Dashboard tab",
    description:
      "MOIRA NWOS v20 is the National Wealth Operating System. The Dashboard shows the 3D Global Pulse Globe with India-USA node connections and the Sovereign Wealth Algorithm tracking $3T (India) and $30T (USA) in real-time.",
  },
  {
    title: "Wealth Algorithms — Live Yield",
    target: "Dashboard → Wealth Panel",
    description:
      "The Wealth Algorithm Panel shows compound yield tickers updating every second. India Pool: $3T at 4.2% p.a. USA Pool: $30T at 5.8% p.a. Watch the sovereign yield accumulate in real-time.",
  },
  {
    title: "Vault — Quantum-Resistant Security",
    target: "Vault tab",
    description:
      "The MOIRA Vault is secured by 26.ai with CRYSTALS-Kyber, SPHINCS+, and DILITHIUM post-quantum algorithms. Enter PIN 262626 to unlock. Quantum key rotates every 8 seconds. 3 wrong attempts triggers a 30-second breach lockout.",
  },
  {
    title: "Brain — 262626 Self-Healing Audit",
    target: "Brain tab",
    description:
      "The 262626 Standard automates compliance audits every 60 seconds across 6 modules. Current score: 98/100 — SAFE BANKING CERTIFIED. The Self-Healing Toolkit auto-restores system integrity on fault detection.",
  },
  {
    title: "M.Sim Strong Room",
    target: "M.Sim tab",
    description:
      "The M.Sim Strong Room is a sovereign banking channel with distinct violet identity — completely separate from standard banking. Access with PIN 262626. Four sealed assets are revealed on unlock with Sealed Audit Record export.",
  },
  {
    title: "6G Architecture — Network Slicing",
    target: "6G tab",
    description:
      "MOIRA NWOS is 6G-ready with three network slices: eMBB (broadband), URLLC (sovereign financial data, sub-ms), mMTC (massive IoT). Edge nodes: IN-NORTH (Mumbai), IN-SOUTH (Chennai), US-EAST (Virginia), US-WEST (Oregon).",
  },
  {
    title: "GOI Command — Property Tokenization",
    target: "GOI tab",
    description:
      "The GOI Command Center manages 1 lakh bank properties tokenized on-chain. Total value: ₹4,20,000 Crores. Live settlement queue shows properties cycling PENDING → SETTLING → SETTLED. Prosperity Tracker monitors 1,000 high-value jobs.",
  },
  {
    title: "Bio-Sovereign Layer",
    target: "Bio-Sensor bar (browser chrome)",
    description:
      "The Di=AI FIREWALL monitors Heart Rate, Blood Pressure, and SpO2 in real-time. DISTRESS threshold auto-engages Inaction Safety. The Golden 3rd Eye Aura activates when Bio reads NORMAL and Bank Mode is ON.",
  },
  {
    title: "Digital Smile — Behavioral DNA",
    target: "Digital Smile bar (browser chrome)",
    description:
      "The Digital Smile engine tracks swipe velocity, typing cadence, and navigation rhythm to build a Behavioral DNA baseline. Generic behavior = green :) smile. Anomaly detection auto-triggers Inaction Safety for paramount security.",
  },
  {
    title: "Manufacturer Slots SDK",
    target: "Brain tab → Manufacturer Slots",
    description:
      "The Universal API/SDK enables mandatory hardware-level integration at sdk.moira.nwos.ai/v1/hardware. Currently registered: IoT Smart Meter, EV Vehicle Gateway, Industrial PLC, Security Camera. Register new hardware slots from the Brain tab.",
  },
];

interface Props {
  onClose: () => void;
}

export default function DemoTour({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), 100);
    return () => clearTimeout(t);
  }, []);

  const current = STEPS[step];

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center p-4"
          style={{
            background: "oklch(0 0 0 / 0.6)",
            backdropFilter: "blur(4px)",
          }}
        >
          <motion.div
            initial={{ y: 40, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="w-full max-w-[420px] rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.12 0.02 255)",
              border: "1px solid oklch(0.3 0.05 75 / 0.6)",
              boxShadow: "0 0 60px oklch(0.78 0.12 75 / 0.2)",
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 border-b"
              style={{
                borderColor: "oklch(0.22 0.025 255)",
                background: "oklch(0.10 0.018 255)",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">▶</span>
                  <p
                    className="text-xs font-display font-bold tracking-wider"
                    style={{ color: "oklch(0.88 0.08 75)" }}
                  >
                    PARLIAMENTARY DEMO TOUR
                  </p>
                </div>
                <button
                  type="button"
                  data-ocid="demo_tour.close_button"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-mono-code"
                  style={{ color: "oklch(0.55 0.08 255)" }}
                >
                  Key Code:
                </span>
                <span
                  className="text-[11px] font-mono-code font-bold tracking-widest px-2 py-0.5 rounded"
                  style={{
                    background: "oklch(0.22 0.04 75 / 0.3)",
                    border: "1px solid oklch(0.45 0.08 75 / 0.4)",
                    color: "oklch(0.88 0.1 75)",
                  }}
                >
                  262626
                </span>
                <span
                  className="ml-auto text-[10px] font-mono-code"
                  style={{ color: "oklch(0.55 0.08 255)" }}
                >
                  Step {step + 1}/{STEPS.length}
                </span>
              </div>
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="px-4 py-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-display font-bold"
                    style={{
                      background: "oklch(0.22 0.04 75 / 0.4)",
                      border: "1px solid oklch(0.45 0.08 75 / 0.5)",
                      color: "oklch(0.88 0.1 75)",
                    }}
                  >
                    {step + 1}
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-sm font-display font-bold mb-1"
                      style={{ color: "oklch(0.92 0.08 75)" }}
                    >
                      {current.title}
                    </p>
                    <p
                      className="text-[10px] font-mono-code mb-2"
                      style={{ color: "oklch(0.6 0.1 200)" }}
                    >
                      → {current.target}
                    </p>
                    <p
                      className="text-xs font-body leading-relaxed"
                      style={{ color: "oklch(0.75 0.03 255)" }}
                    >
                      {current.description}
                    </p>
                  </div>
                </div>

                {/* Step dots */}
                <div className="flex justify-center gap-1.5 mt-4">
                  {STEPS.map((stepItem, stepIdx) => (
                    <button
                      key={stepItem.title}
                      type="button"
                      onClick={() => setStep(stepIdx)}
                      className="rounded-full transition-all"
                      style={{
                        width: stepIdx === step ? 16 : 6,
                        height: 6,
                        background:
                          stepIdx === step
                            ? "oklch(0.78 0.12 75)"
                            : stepIdx < step
                              ? "oklch(0.55 0.08 75)"
                              : "oklch(0.28 0.03 255)",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center gap-2 px-4 pb-4">
              <Button
                data-ocid="demo_tour.prev.button"
                variant="outline"
                size="sm"
                disabled={step === 0}
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 h-9 text-xs disabled:opacity-30"
                style={{
                  background: "oklch(0.16 0.022 255)",
                  borderColor: "oklch(0.28 0.03 255)",
                  color: "oklch(0.75 0.04 255)",
                }}
              >
                ← Prev
              </Button>
              {step < STEPS.length - 1 ? (
                <Button
                  data-ocid="demo_tour.next.primary_button"
                  size="sm"
                  onClick={() => setStep((s) => s + 1)}
                  className="flex-1 h-9 text-xs font-display font-semibold"
                  style={{
                    background: "oklch(0.22 0.04 75)",
                    border: "1px solid oklch(0.45 0.08 75 / 0.5)",
                    color: "oklch(0.92 0.1 75)",
                  }}
                >
                  Next →
                </Button>
              ) : (
                <Button
                  data-ocid="demo_tour.end.primary_button"
                  size="sm"
                  onClick={onClose}
                  className="flex-1 h-9 text-xs font-display font-semibold"
                  style={{
                    background: "oklch(0.55 0.16 145 / 0.3)",
                    border: "1px solid oklch(0.55 0.16 145 / 0.5)",
                    color: "oklch(0.75 0.14 145)",
                  }}
                >
                  End Tour
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
