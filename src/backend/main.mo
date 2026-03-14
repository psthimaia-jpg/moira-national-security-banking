import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Float "mo:core/Float";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Nat "mo:core/Nat";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  type Account = {
    accountNumber : Text;
    accountType : { #checking; #savings };
    balance : Float;
  };

  type Transaction = {
    amount : Float;
    description : Text;
    category : Text;
    transactionType : { #debit; #credit };
    timestamp : Time.Time;
  };

  type Budget = {
    category : Text;
    amount : Float;
  };

  type ChatMessage = {
    sender : { #user; #ai };
    message : Text;
    timestamp : Time.Time;
  };

  type SensorEvent = {
    eventType : Text;
    value : Text;
    timestamp : Time.Time;
  };

  type FinancialSummary = {
    totalBalance : Float;
    monthlyIncome : Float;
    monthlyExpenses : Float;
    savingsRate : Float;
  };

  type HealthEvent = {
    pillar : Text;
    status : Text;
    detail : Text;
    timestamp : Time.Time;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
  };

  public type LibraryResource = {
    id : Text;
    title : Text;
    category : Text;
    description : Text;
    body : Text;
    tags : [Text];
    readMinutes : Nat;
    featured : Bool;
    timestamp : Time.Time;
  };

  module Transaction {
    public func compare(trans1 : Transaction, trans2 : Transaction) : Order.Order {
      if (trans1.timestamp < trans2.timestamp) { #less } else if (trans1.timestamp > trans2.timestamp) {
        #greater;
      } else { Text.compare(trans1.category, trans2.category) };
    };

    public func compareByCategory(trans1 : Transaction, trans2 : Transaction) : Order.Order {
      Text.compare(trans1.category, trans2.category);
    };
  };

  module ChatMessage {
    public func compare(msg1 : ChatMessage, msg2 : ChatMessage) : Order.Order {
      if (msg1.timestamp < msg2.timestamp) { #less } else if (msg1.timestamp > msg2.timestamp) {
        #greater;
      } else { Text.compare(msg1.message, msg2.message) };
    };
  };

  let accounts = Map.empty<Principal, Account>();
  let transactions = Map.empty<Principal, List.List<Transaction>>();
  let budgets = Map.empty<Principal, Map.Map<Text, Budget>>();
  let chats = Map.empty<Principal, List.List<ChatMessage>>();
  let sensorEvents = Map.empty<Principal, List.List<SensorEvent>>();
  let healthEvents = Map.empty<Principal, List.List<HealthEvent>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let libraryResources = Map.empty<Text, LibraryResource>();

  // Authorization initialization
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Bank account management
  public shared ({ caller }) func createAccount(accountNumber : Text, accountType : { #checking; #savings }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    if (accounts.containsKey(caller)) { Runtime.trap("Account already exists") };

    let newAccount : Account = {
      accountNumber;
      accountType;
      balance = 0.0;
    };
    accounts.add(caller, newAccount);
    transactions.add(caller, List.empty<Transaction>());
    budgets.add(caller, Map.empty<Text, Budget>());
    chats.add(caller, List.empty<ChatMessage>());
    sensorEvents.add(caller, List.empty<SensorEvent>());
  };

  public query ({ caller }) func getAccount() : async Account {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (accounts.get(caller)) {
      case (null) { Runtime.trap("Account does not exist") };
      case (?account) { account };
    };
  };

  // Transaction management
  public shared ({ caller }) func addTransaction(amount : Float, description : Text, category : Text, transactionType : { #debit; #credit }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let account = switch (accounts.get(caller)) {
      case (null) { Runtime.trap("Account does not exist") };
      case (?account) { account };
    };

    let newBalance = switch (transactionType) {
      case (#debit) { account.balance - amount };
      case (#credit) { account.balance + amount };
    };

    let updatedAccount : Account = {
      accountNumber = account.accountNumber;
      accountType = account.accountType;
      balance = newBalance;
    };

    let transaction : Transaction = {
      amount;
      description;
      category;
      transactionType;
      timestamp = Time.now();
    };

    let userTransactions = switch (transactions.get(caller)) {
      case (null) { List.empty<Transaction>() };
      case (?list) { list };
    };

    userTransactions.add(transaction);
    transactions.add(caller, userTransactions);
    accounts.add(caller, updatedAccount);
  };

  public query ({ caller }) func getTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (transactions.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray().sort() };
    };
  };

  // Budget management
  public shared ({ caller }) func setBudget(category : Text, amount : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let userBudgets = switch (budgets.get(caller)) {
      case (null) { Map.empty<Text, Budget>() };
      case (?map) { map };
    };

    let budget : Budget = { category; amount };
    userBudgets.add(category, budget);
    budgets.add(caller, userBudgets);
  };

  public query ({ caller }) func getBudget(category : Text) : async Budget {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (budgets.get(caller)) {
      case (null) { Runtime.trap("No budgets found") };
      case (?userBudgets) {
        switch (userBudgets.get(category)) {
          case (null) { Runtime.trap("No budget found for category " # category) };
          case (?budget) { budget };
        };
      };
    };
  };

  // Chat message management
  public shared ({ caller }) func addChatMessage(message : Text, sender : { #user; #ai }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let chatMessage : ChatMessage = {
      sender;
      message;
      timestamp = Time.now();
    };

    let userChats = switch (chats.get(caller)) {
      case (null) { List.empty<ChatMessage>() };
      case (?list) { list };
    };

    userChats.add(chatMessage);
    chats.add(caller, userChats);
  };

  public query ({ caller }) func getChatHistory() : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (chats.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray().sort() };
    };
  };

  // Sensor event logging
  public shared ({ caller }) func logSensorEvent(eventType : Text, value : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let event : SensorEvent = {
      eventType;
      value;
      timestamp = Time.now();
    };

    let userEvents = switch (sensorEvents.get(caller)) {
      case (null) { List.empty<SensorEvent>() };
      case (?list) { list };
    };

    userEvents.add(event);
    sensorEvents.add(caller, userEvents);
  };

  public query ({ caller }) func getSensorEvents() : async [SensorEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    switch (sensorEvents.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  // Health event logging
  public shared ({ caller }) func logHealthEvent(pillar : Text, status : Text, detail : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log health events");
    };

    let event : HealthEvent = {
      pillar;
      status;
      detail;
      timestamp = Time.now();
    };

    let userEvents = switch (healthEvents.get(caller)) {
      case (null) { List.empty<HealthEvent>() };
      case (?list) { list };
    };

    userEvents.add(event);
    healthEvents.add(caller, userEvents);
  };

  public query ({ caller }) func getHealthLog() : async [HealthEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access health log");
    };

    switch (healthEvents.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  // Spending insights
  public query ({ caller }) func getSpendingByCategory() : async [(Text, Float)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let categoryMap = Map.empty<Text, Float>();

    switch (transactions.get(caller)) {
      case (null) {};
      case (?userTransactions) {
        for (txn in userTransactions.values()) {
          let currentTotal = switch (categoryMap.get(txn.category)) {
            case (null) { 0.0 };
            case (?total) { total };
          };
          categoryMap.add(txn.category, currentTotal + txn.amount);
        };
      };
    };

    categoryMap.toArray();
  };

  // Financial summary
  public query ({ caller }) func getFinancialSummary() : async FinancialSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let account = switch (accounts.get(caller)) {
      case (null) { Runtime.trap("Account does not exist") };
      case (?account) { account };
    };

    let income = switch (transactions.get(caller)) {
      case (null) { 0.0 };
      case (?userTransactions) {
        userTransactions.values().toArray().filter(func(t) { t.transactionType == #credit }).foldLeft(
          0.0,
          func(acc, t) { acc + t.amount },
        );
      };
    };

    let expenses = switch (transactions.get(caller)) {
      case (null) { 0.0 };
      case (?userTransactions) {
        userTransactions.values().toArray().filter(func(t) { t.transactionType == #debit }).foldLeft(
          0.0,
          func(acc, t) { acc + t.amount },
        );
      };
    };

    let summary : FinancialSummary = {
      totalBalance = account.balance;
      monthlyIncome = income;
      monthlyExpenses = expenses;
      savingsRate = if (income > 0) { (income - expenses) / income * 100 } else { 0.0 };
    };

    summary;
  };

  // Library resource management
  public shared ({ caller }) func addLibraryResource(
    title : Text,
    category : Text,
    description : Text,
    body : Text,
    tags : [Text],
    readMinutes : Nat,
    featured : Bool,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add resources");
    };

    let id = (libraryResources.size() + 1).toText(); // Simple unique ID generation
    let resource : LibraryResource = {
      id;
      title;
      category;
      description;
      body;
      tags;
      readMinutes;
      featured;
      timestamp = Time.now();
    };

    libraryResources.add(id, resource);
  };

  public query func getLibraryResources() : async [LibraryResource] {
    // Accessible by all authenticated users including guests - no authorization check needed
    libraryResources.values().toArray();
  };

  public query func getLibraryResource(_id : Text) : async LibraryResource {
    // Accessible by all authenticated users including guests - no authorization check needed
    switch (libraryResources.get(_id)) {
      case (null) { Runtime.trap("Resource not found") };
      case (?resource) { resource };
    };
  };
};
