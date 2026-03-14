import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OctagonX, Send, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface Msg {
  id: string;
  role: "user" | "ai";
  text: string;
  ts: string;
}

function nowTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SEED: Msg[] = [
  {
    id: "s1",
    role: "ai",
    text: "Welcome to MOIRA NWOS v20 — National Wealth Operating System. I am your sovereign AI assistant. Ask me about your balance, yield algorithms, vault security, or the $3T India / $30T USA wealth pools.",
    ts: nowTime(),
  },
];

function getBotResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("balance"))
    return "Your current NWOS account balance is ₹4,82,500. The vault holds ₹4,82,500 in protected assets. Unlock the vault with PIN 262626 for full details.";
  if (q.includes("yield") || q.includes("wealth") || q.includes("algorithm"))
    return "NWOS Wealth Algorithms are active. India Pool: $3T base at 4.2% p.a. — generating $126B annually. USA Pool: $30T base at 5.8% p.a. — generating $1.74T annually. Real-time turnaround is live on the Dashboard.";
  if (q.includes("vault") || q.includes("262626") || q.includes("pin"))
    return "The MOIRA Vault is secured by 26.ai with CRYSTALS-Kyber quantum-resistant encryption. Use PIN 262626 to unlock. 3 failed attempts triggers a 30-second breach lockout.";
  if (q.includes("262626") || q.includes("safe banking") || q.includes("audit"))
    return "The 262626 Standard is the Self-Healing Configuration baseline for MOIRA NWOS. It runs automated compliance audits every 60 seconds covering 6 modules. Current score: 98/100 — SAFE BANKING CERTIFIED.";
  if (q.includes("6g") || q.includes("latency"))
    return "MOIRA NWOS is 6G-ready with sub-millisecond latency (0.3ms-0.9ms). Three network slices: eMBB for broadband, URLLC for sovereign financial data, mMTC for IoT devices. Sovereign data is isolated per slice.";
  if (q.includes("india") || q.includes("goi") || q.includes("property"))
    return "The GOI Command tab manages 1 lakh bank properties tokenized on-chain. Total value: ₹4,20,000 Crores. The Prosperity Tracker monitors 1,000 high-value jobs across the India-USA Economic Corridor.";
  if (q.includes("quantum") || q.includes("security") || q.includes("kyber"))
    return "MOIRA NWOS implements CRYSTALS-Kyber for key encapsulation, SPHINCS+ for signatures, and DILITHIUM for authentication — all NIST post-quantum standards. Keys rotate every 8 seconds in the Vault.";
  if (q.includes("msim") || q.includes("strong room"))
    return "The M.Sim Strong Room is a sovereign banking channel with violet identity. Access it with PIN 262626 for sealed asset management. It is isolated from standard banking channels.";
  if (
    q.includes("manufacturer") ||
    q.includes("sdk") ||
    q.includes("iot") ||
    q.includes("ev")
  )
    return "The Universal Manufacturer API/SDK is active at sdk.moira.nwos.ai/v1/hardware. Currently registered slots: IoT Smart Meter, EV Vehicle Gateway, Industrial PLC, Security Camera. Register new hardware in the Brain tab.";
  if (q.includes("hello") || q.includes("hi") || q.includes("namaste"))
    return "Namaste! I am MOIRA — your National Wealth Operating System AI. How can I assist with sovereign asset management today?";
  if (q.includes("spending") || q.includes("expense"))
    return "Your monthly expenses: Food ₹12,800 | Bills ₹4,500 | Transport ₹8,900 | Entertainment ₹3,200. Total: ₹29,400. Savings rate: 38%. Review the Transactions tab for full history.";
  return `I understand your query about '${input}'. As the MOIRA NWOS AI, I specialize in sovereign wealth management, quantum-secure banking, and national asset intelligence. Please ask about: balance, yield algorithms, vault security, 6G architecture, GOI property tokenization, or the 262626 standard.`;
}

interface Props {
  inactionActive?: boolean;
  onKeystroke?: (intervalMs: number) => void;
}

export default function ChatPage({
  inactionActive = false,
  onKeystroke,
}: Props) {
  const [messages, setMessages] = useState<Msg[]>(SEED);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const send = () => {
    if (!input.trim() || inactionActive) return;
    const userMsg: Msg = {
      id: `u${Date.now()}`,
      role: "user",
      text: input.trim(),
      ts: nowTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const q = input.trim();
    setInput("");
    setTyping(true);
    setTimeout(
      () => {
        setTyping(false);
        const aiMsg: Msg = {
          id: `a${Date.now()}`,
          role: "ai",
          text: getBotResponse(q),
          ts: nowTime(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      },
      900 + Math.random() * 600,
    );
  };

  return (
    <div className="flex flex-col h-full">
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

      {/* Header */}
      <div
        className="px-3 py-3 border-b"
        style={{ borderColor: "oklch(0.22 0.025 255)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "oklch(0.22 0.04 75 / 0.3)",
              border: "1px solid oklch(0.45 0.08 75 / 0.4)",
            }}
          >
            <Sparkles
              className="w-4 h-4"
              style={{ color: "oklch(0.78 0.12 75)" }}
            />
          </div>
          <div>
            <p
              className="text-sm font-display font-bold"
              style={{ color: "oklch(0.88 0.08 75)" }}
            >
              MOIRA AI
            </p>
            <p
              className="text-[10px] font-body"
              style={{ color: "oklch(0.55 0.08 255)" }}
            >
              National Wealth OS Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[85%] px-3 py-2 rounded-xl"
                style={{
                  background:
                    msg.role === "user"
                      ? "oklch(0.22 0.04 75 / 0.8)"
                      : "oklch(0.18 0.025 255)",
                  border: `1px solid ${msg.role === "user" ? "oklch(0.45 0.08 75 / 0.4)" : "oklch(0.28 0.03 255)"}`,
                }}
              >
                <p
                  className="text-xs font-body leading-relaxed"
                  style={{
                    color:
                      msg.role === "user"
                        ? "oklch(0.92 0.08 75)"
                        : "oklch(0.9 0.01 255)",
                  }}
                >
                  {msg.text}
                </p>
                <p
                  className="text-[9px] mt-1"
                  style={{ color: "oklch(0.45 0.03 255)" }}
                >
                  {msg.ts}
                </p>
              </div>
            </motion.div>
          ))}
          {typing && (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div
                className="px-3 py-2 rounded-xl"
                style={{
                  background: "oklch(0.18 0.025 255)",
                  border: "1px solid oklch(0.28 0.03 255)",
                }}
              >
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [-2, 2, -2] }}
                      transition={{
                        duration: 0.6,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.15,
                      }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "oklch(0.55 0.08 255)" }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-3 py-3 border-t"
        style={{ borderColor: "oklch(0.22 0.025 255)" }}
      >
        <div className="flex gap-2">
          <Input
            data-ocid="chat.input"
            placeholder="Ask MOIRA about wealth, security, GOI..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              onKeystroke?.(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            disabled={inactionActive}
            className="flex-1 bg-navy-raised border-border text-xs text-foreground placeholder:text-muted-foreground disabled:opacity-40"
          />
          <Button
            data-ocid="chat.send.primary_button"
            size="icon"
            onClick={send}
            disabled={!input.trim() || inactionActive}
            className="w-9 h-9 rounded-lg flex-shrink-0 disabled:opacity-40"
            style={{
              background: "oklch(0.22 0.04 75)",
              border: "1px solid oklch(0.45 0.08 75 / 0.5)",
            }}
          >
            <Send
              className="w-3.5 h-3.5"
              style={{ color: "oklch(0.88 0.1 75)" }}
            />
          </Button>
        </div>
        <p
          className="text-[9px] mt-2 text-center font-body"
          style={{ color: "oklch(0.35 0.03 255)" }}
        >
          MOIRA AI · NWOS v20 · Powered by 26.ai
        </p>
      </div>
    </div>
  );
}
