import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type Account,
  type ChatMessage,
  type FinancialSummary,
  type SensorEvent,
  type Transaction,
  type UserProfile,
  Variant_ai_user,
  Variant_checking_savings,
  Variant_credit_debit,
} from "../backend.d";
import { useActor } from "./useActor";

// ── Accounts ────────────────────────────────────────────────
export function useGetAccount() {
  const { actor, isFetching } = useActor();
  return useQuery<Account | null>({
    queryKey: ["account"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getAccount();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      accountNumber,
      accountType,
    }: {
      accountNumber: string;
      accountType: Variant_checking_savings;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createAccount(accountNumber, accountType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });
}

// ── Transactions ─────────────────────────────────────────────
export function useGetTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getTransactions();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      description,
      category,
      transactionType,
    }: {
      amount: number;
      description: string;
      category: string;
      transactionType: Variant_credit_debit;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addTransaction(
        amount,
        description,
        category,
        transactionType,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["financialSummary"] });
      queryClient.invalidateQueries({ queryKey: ["spendingByCategory"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });
}

// ── Financial Summary ────────────────────────────────────────
export function useGetFinancialSummary() {
  const { actor, isFetching } = useActor();
  return useQuery<FinancialSummary | null>({
    queryKey: ["financialSummary"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getFinancialSummary();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Spending by Category ─────────────────────────────────────
export function useGetSpendingByCategory() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, number]>>({
    queryKey: ["spendingByCategory"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getSpendingByCategory();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Chat ─────────────────────────────────────────────────────
export function useGetChatHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<ChatMessage[]>({
    queryKey: ["chatHistory"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getChatHistory();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddChatMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      message,
      sender,
    }: {
      message: string;
      sender: Variant_ai_user;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addChatMessage(message, sender);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });
}

// ── Sensors ──────────────────────────────────────────────────
export function useGetSensorEvents() {
  const { actor, isFetching } = useActor();
  return useQuery<SensorEvent[]>({
    queryKey: ["sensorEvents"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getSensorEvents();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLogSensorEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventType,
      value,
    }: {
      eventType: string;
      value: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.logSensorEvent(eventType, value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sensorEvents"] });
    },
  });
}

// ── Budget ───────────────────────────────────────────────────
export function useSetBudget() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      category,
      amount,
    }: {
      category: string;
      amount: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.setBudget(category, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget"] });
    },
  });
}

// ── User Profile ─────────────────────────────────────────────
export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// ── Health Events ─────────────────────────────────────────────
export function useGetHealthLog() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["healthLog"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getHealthLog();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLogHealthEvent() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      pillar,
      status,
      detail,
    }: {
      pillar: string;
      status: string;
      detail: string;
    }) => {
      if (!actor) return;
      return actor.logHealthEvent(pillar, status, detail);
    },
  });
}

export { Variant_ai_user, Variant_checking_savings, Variant_credit_debit };
