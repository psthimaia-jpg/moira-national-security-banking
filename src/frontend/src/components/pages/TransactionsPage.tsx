import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OctagonX, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORY_ICONS: Record<string, string> = {
  Food: "🍔",
  Transport: "🚌",
  Shopping: "🛍️",
  Salary: "💰",
  Bills: "📋",
  Entertainment: "🎬",
  Other: "📦",
};

type TxType = "credit" | "debit";

interface Tx {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: TxType;
  date: string;
}

const SEED_TXS: Tx[] = [
  {
    id: "t1",
    amount: 48250,
    description: "Monthly Salary",
    category: "Salary",
    type: "credit",
    date: "Mar 1",
  },
  {
    id: "t2",
    amount: 12800,
    description: "Grocery Shopping",
    category: "Food",
    type: "debit",
    date: "Mar 3",
  },
  {
    id: "t3",
    amount: 4500,
    description: "Electricity Bill",
    category: "Bills",
    type: "debit",
    date: "Mar 5",
  },
  {
    id: "t4",
    amount: 8900,
    description: "Metro Pass",
    category: "Transport",
    type: "debit",
    date: "Mar 7",
  },
  {
    id: "t5",
    amount: 25000,
    description: "Freelance Payment",
    category: "Salary",
    type: "credit",
    date: "Mar 9",
  },
  {
    id: "t6",
    amount: 3200,
    description: "Netflix & OTT",
    category: "Entertainment",
    type: "debit",
    date: "Mar 10",
  },
];

const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Salary",
  "Bills",
  "Entertainment",
  "Other",
];

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface Props {
  inactionActive?: boolean;
}

export default function TransactionsPage({ inactionActive = false }: Props) {
  const [transactions, setTransactions] = useState<Tx[]>(SEED_TXS);
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    description: "",
    category: "Food",
    type: "debit" as TxType,
  });

  const filtered = transactions.filter(
    (tx) => filter === "all" || tx.type === filter,
  );

  const handleAdd = () => {
    if (!form.amount || !form.description) {
      toast.error("Fill all fields");
      return;
    }
    const newTx: Tx = {
      id: `t${Date.now()}`,
      amount: Number(form.amount),
      description: form.description,
      category: form.category,
      type: form.type,
      date: new Date().toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      }),
    };
    setTransactions((prev) => [newTx, ...prev]);
    setForm({ amount: "", description: "", category: "Food", type: "debit" });
    setAddOpen(false);
    toast.success("Transaction added");
  };

  return (
    <div className="pb-4 relative">
      {inactionActive && (
        <div
          className="absolute inset-0 z-30 bg-[oklch(0.08_0.015_20/0.7)] flex items-center justify-center pointer-events-none"
          style={{ backdropFilter: "blur(2px)" }}
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

      <div className="flex items-center justify-between mx-3 mt-3 mb-3">
        <p
          className="text-sm font-display font-bold"
          style={{ color: "oklch(0.88 0.08 75)" }}
        >
          Transactions
        </p>
        <Button
          data-ocid="transactions.add.open_modal_button"
          size="sm"
          disabled={inactionActive}
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1 text-xs h-7 px-2 disabled:opacity-40"
          style={{
            background: "oklch(0.22 0.04 75)",
            border: "1px solid oklch(0.45 0.08 75 / 0.5)",
            color: "oklch(0.88 0.1 75)",
          }}
        >
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mx-3 mb-3">
        {(["all", "credit", "debit"] as const).map((f) => (
          <button
            key={f}
            type="button"
            data-ocid={`transactions.${f}.tab`}
            onClick={() => setFilter(f)}
            className="flex-1 py-1.5 text-xs font-display font-semibold rounded-lg transition-all capitalize"
            style={{
              background:
                filter === f
                  ? "oklch(0.22 0.04 75 / 0.8)"
                  : "oklch(0.16 0.022 255)",
              border: `1px solid ${filter === f ? "oklch(0.55 0.1 75 / 0.5)" : "oklch(0.26 0.03 255)"}`,
              color:
                filter === f ? "oklch(0.88 0.1 75)" : "oklch(0.55 0.04 255)",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div
        className="mx-3 rounded-xl overflow-hidden"
        style={{ border: "1px solid oklch(0.26 0.03 255)" }}
      >
        {filtered.length === 0 ? (
          <div
            data-ocid="transactions.empty_state"
            className="py-8 text-center text-xs text-muted-foreground"
          >
            No transactions
          </div>
        ) : (
          filtered.map((tx, i) => (
            <div
              key={tx.id}
              data-ocid={`transactions.item.${i + 1}`}
              className="flex items-center gap-3 px-3 py-3 border-b last:border-0"
              style={{
                background: "oklch(0.16 0.022 255)",
                borderColor: "oklch(0.22 0.025 255)",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: "oklch(0.2 0.025 255)" }}
              >
                {CATEGORY_ICONS[tx.category] ?? "📦"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-body font-medium text-foreground truncate">
                  {tx.description}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge
                    variant="outline"
                    className="text-[9px] py-0 px-1 h-4"
                    style={{
                      borderColor: "oklch(0.35 0.04 255)",
                      color: "oklch(0.55 0.04 255)",
                    }}
                  >
                    {tx.category}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {tx.date}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {tx.type === "credit" ? (
                  <TrendingUp
                    className="w-3 h-3"
                    style={{ color: "oklch(0.65 0.16 150)" }}
                  />
                ) : (
                  <TrendingDown
                    className="w-3 h-3"
                    style={{ color: "oklch(0.65 0.22 15)" }}
                  />
                )}
                <span
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
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          data-ocid="transactions.add.dialog"
          style={{
            background: "oklch(0.14 0.02 255)",
            border: "1px solid oklch(0.28 0.03 255)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground font-display">
              Add Transaction
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">
                Amount (₹)
              </Label>
              <Input
                data-ocid="transactions.amount.input"
                type="number"
                placeholder="0"
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
                className="mt-1 bg-navy-raised border-border text-foreground"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Description
              </Label>
              <Input
                data-ocid="transactions.description.input"
                placeholder="Transaction description"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="mt-1 bg-navy-raised border-border text-foreground"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger
                  data-ocid="transactions.category.select"
                  className="mt-1 bg-navy-raised border-border text-foreground"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: "oklch(0.16 0.022 255)" }}>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, type: v as TxType }))
                }
              >
                <SelectTrigger
                  data-ocid="transactions.type.select"
                  className="mt-1 bg-navy-raised border-border text-foreground"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: "oklch(0.16 0.022 255)" }}>
                  <SelectItem value="credit">Credit (+)</SelectItem>
                  <SelectItem value="debit">Debit (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                data-ocid="transactions.add.cancel_button"
                variant="outline"
                className="flex-1"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="transactions.add.submit_button"
                className="flex-1"
                onClick={handleAdd}
                style={{
                  background: "oklch(0.22 0.04 75)",
                  color: "oklch(0.88 0.1 75)",
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
