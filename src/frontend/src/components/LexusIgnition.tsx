import { Cpu } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const STEPS = [
  { id: "scan", label: "SCAN", description: "Scanning device silicon..." },
  {
    id: "align",
    label: "ALIGN",
    description: "Aligning cryptographic keys...",
  },
  { id: "lock", label: "LOCK", description: "Hardware lock engaged..." },
  { id: "ignite", label: "IGNITE", description: "e-M-Sim ignited ✓" },
] as const;

export default function LexusIgnition() {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = not started
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSequence = () => {
    setCurrentStep(-1);
    setCompletedSteps(new Set());
    setIsComplete(false);

    // Brief delay before starting
    timerRef.current = setTimeout(() => {
      setCurrentStep(0);

      STEPS.forEach((_, idx) => {
        const startDelay = (idx + 1) * 850;
        timerRef.current = setTimeout(() => {
          setCompletedSteps((prev) => {
            const next = new Set(prev);
            next.add(idx);
            return next;
          });
          if (idx < STEPS.length - 1) {
            setCurrentStep(idx + 1);
          } else {
            setCurrentStep(STEPS.length); // all done
            setIsComplete(true);
          }
        }, startDelay);
      });
    }, 300);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    runSequence();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const progressPct =
    completedSteps.size === 0 ? 0 : (completedSteps.size / STEPS.length) * 100;

  return (
    <motion.div
      data-ocid="sensors.lexus_ignition.panel"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-3 mb-3 rounded-xl overflow-hidden"
      style={{
        background: "oklch(0.09 0.013 255)",
        border: "1px solid oklch(0.72 0.18 200 / 0.4)",
        boxShadow: "0 0 20px oklch(0.72 0.18 200 / 0.1)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-3 py-2.5 border-b"
        style={{ borderColor: "oklch(0.72 0.18 200 / 0.2)" }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "oklch(0.72 0.18 200 / 0.15)",
            border: "1px solid oklch(0.72 0.18 200 / 0.4)",
          }}
        >
          <Cpu
            className="w-3.5 h-3.5"
            style={{ color: "oklch(0.72 0.18 200)" }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-[10px] font-mono tracking-widest font-bold"
            style={{ color: "oklch(0.72 0.18 200)" }}
          >
            e-M-Sim IGNITION SEQUENCE
          </div>
          <div
            className="text-[8px] font-mono tracking-wider"
            style={{ color: "oklch(0.45 0.08 200)" }}
          >
            NVIDIA Secure Enclave · Lexus Edition
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-1 w-full"
        style={{ background: "oklch(0.18 0.025 255)" }}
      >
        <motion.div
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.72 0.18 200), oklch(0.65 0.16 150))",
            boxShadow: "0 0 8px oklch(0.72 0.18 200 / 0.6)",
          }}
        />
      </div>

      {/* Steps */}
      <div className="px-3 py-2.5 space-y-1.5">
        {STEPS.map((step, idx) => {
          const isDone = completedSteps.has(idx);
          const isCurrent = currentStep === idx;

          return (
            <div key={step.id} className="flex items-center gap-2.5">
              {/* Step indicator */}
              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 600, damping: 20 }}
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{
                      background: "oklch(0.65 0.16 150 / 0.2)",
                      border: "1px solid oklch(0.65 0.16 150 / 0.6)",
                    }}
                  >
                    <span
                      className="text-[8px] font-mono font-bold"
                      style={{ color: "oklch(0.72 0.16 150)" }}
                    >
                      ✓
                    </span>
                  </motion.div>
                ) : isCurrent ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="w-4 h-4 rounded-full"
                    style={{
                      border: "1.5px solid oklch(0.72 0.18 200 / 0.2)",
                      borderTopColor: "oklch(0.72 0.18 200)",
                    }}
                  />
                ) : (
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      border: "1px dashed oklch(0.35 0.04 255 / 0.6)",
                    }}
                  />
                )}
              </div>

              {/* Step label */}
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <AnimatePresence mode="wait">
                  {isCurrent ? (
                    <motion.span
                      key="current"
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{
                        duration: 0.7,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                      className="text-[10px] font-mono font-bold tracking-widest w-12 flex-shrink-0"
                      style={{ color: "oklch(0.72 0.18 200)" }}
                    >
                      {step.label}
                    </motion.span>
                  ) : (
                    <span
                      key="static"
                      className="text-[10px] font-mono font-bold tracking-widest w-12 flex-shrink-0"
                      style={{
                        color: isDone
                          ? "oklch(0.65 0.16 150)"
                          : "oklch(0.35 0.04 255)",
                      }}
                    >
                      {step.label}
                    </span>
                  )}
                </AnimatePresence>
                <span
                  className="text-[9px] font-mono truncate"
                  style={{
                    color: isDone
                      ? "oklch(0.55 0.1 150)"
                      : isCurrent
                        ? "oklch(0.55 0.1 200)"
                        : "oklch(0.32 0.03 255)",
                  }}
                >
                  {step.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion banner */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mx-3 mb-2.5 rounded-lg px-3 py-2 flex items-center justify-between"
            style={{
              background: "oklch(0.10 0.02 75)",
              border: "1px solid oklch(0.78 0.12 75 / 0.5)",
              boxShadow: "0 0 12px oklch(0.78 0.12 75 / 0.15)",
            }}
          >
            <motion.span
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="text-[9px] font-mono font-bold tracking-widest"
              style={{ color: "oklch(0.78 0.12 75)" }}
            >
              IGNITION COMPLETE — LEXUS EDITION
            </motion.span>
            <span
              className="text-[9px] font-mono"
              style={{ color: "oklch(0.55 0.1 75)" }}
            >
              ✦
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data fields */}
      <div
        className="grid grid-cols-2 gap-2 px-3 pb-2.5"
        style={{ borderTop: isComplete ? "none" : undefined }}
      >
        {[
          { label: "ENCLAVE ID", value: "NV-SECURE-7749-EM" },
          { label: "SILICON BINDING", value: "ACTIVE · 256-bit AES" },
        ].map((field) => (
          <div
            key={field.label}
            className="rounded-lg p-2"
            style={{
              background: "oklch(0.12 0.018 255)",
              border: "1px solid oklch(0.22 0.025 255)",
            }}
          >
            <div
              className="text-[7px] font-mono tracking-widest uppercase mb-1"
              style={{ color: "oklch(0.4 0.04 255)" }}
            >
              {field.label}
            </div>
            <div
              className="text-[9px] font-mono font-bold"
              style={{ color: "oklch(0.72 0.18 200)" }}
            >
              {field.value}
            </div>
          </div>
        ))}
      </div>

      {/* Re-ignite button */}
      <div className="flex justify-end px-3 pb-3">
        <button
          type="button"
          data-ocid="sensors.lexus_ignition.reignite_button"
          onClick={runSequence}
          disabled={currentStep >= 0 && !isComplete}
          className="text-[9px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: "oklch(0.15 0.025 200)",
            border: "1px solid oklch(0.72 0.18 200 / 0.4)",
            color: "oklch(0.65 0.16 200)",
          }}
        >
          ↺ RE-IGNITE
        </button>
      </div>
    </motion.div>
  );
}
