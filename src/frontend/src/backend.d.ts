import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Transaction {
    transactionType: Variant_credit_debit;
    description: string;
    timestamp: Time;
    category: string;
    amount: number;
}
export interface FinancialSummary {
    totalBalance: number;
    monthlyExpenses: number;
    savingsRate: number;
    monthlyIncome: number;
}
export interface Budget {
    category: string;
    amount: number;
}
export type Time = bigint;
export interface Account {
    balance: number;
    accountType: Variant_checking_savings;
    accountNumber: string;
}
export interface HealthEvent {
    status: string;
    detail: string;
    pillar: string;
    timestamp: Time;
}
export interface LibraryResource {
    id: string;
    title: string;
    featured: boolean;
    body: string;
    tags: Array<string>;
    description: string;
    timestamp: Time;
    readMinutes: bigint;
    category: string;
}
export interface ChatMessage {
    sender: Variant_ai_user;
    message: string;
    timestamp: Time;
}
export interface UserProfile {
    name: string;
    email: string;
}
export interface SensorEvent {
    value: string;
    timestamp: Time;
    eventType: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_ai_user {
    ai = "ai",
    user = "user"
}
export enum Variant_checking_savings {
    checking = "checking",
    savings = "savings"
}
export enum Variant_credit_debit {
    credit = "credit",
    debit = "debit"
}
export interface backendInterface {
    addChatMessage(message: string, sender: Variant_ai_user): Promise<void>;
    addLibraryResource(title: string, category: string, description: string, body: string, tags: Array<string>, readMinutes: bigint, featured: boolean): Promise<void>;
    addTransaction(amount: number, description: string, category: string, transactionType: Variant_credit_debit): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAccount(accountNumber: string, accountType: Variant_checking_savings): Promise<void>;
    getAccount(): Promise<Account>;
    getBudget(category: string): Promise<Budget>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChatHistory(): Promise<Array<ChatMessage>>;
    getFinancialSummary(): Promise<FinancialSummary>;
    getHealthLog(): Promise<Array<HealthEvent>>;
    getLibraryResource(_id: string): Promise<LibraryResource>;
    getLibraryResources(): Promise<Array<LibraryResource>>;
    getSensorEvents(): Promise<Array<SensorEvent>>;
    getSpendingByCategory(): Promise<Array<[string, number]>>;
    getTransactions(): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    logHealthEvent(pillar: string, status: string, detail: string): Promise<void>;
    logSensorEvent(eventType: string, value: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setBudget(category: string, amount: number): Promise<void>;
}
