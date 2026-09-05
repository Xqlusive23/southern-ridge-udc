import "server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { BANK_ROUTING, DEMO_ADMIN, DEMO_MEMBER } from "@/lib/constants";
import { hashPassword } from "@/lib/passwords";
import type {
  Account,
  AccountStatus,
  AccountType,
  BankStore,
  PublicUser,
  Transaction,
  TransactionType,
  User,
} from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "bank.json");

let writeChain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => T): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function now() {
  return new Date().toISOString();
}

function daysAgo(days: number, hours = 10) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, 12, 0, 0);
  return date.toISOString();
}

function createId() {
  return crypto.randomUUID();
}

function generateAccountNumber(used: Set<string>) {
  let next = "";
  do {
    next = Array.from({ length: 10 }, () =>
      Math.floor(Math.random() * 10),
    ).join("");
  } while (next.startsWith("0") || used.has(next));
  used.add(next);
  return next;
}

function publicUser(user: User): PublicUser {
  return {
    id: user.id,
    role: user.role,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    address: user.address,
    city: user.city,
    state: user.state,
    zip: user.zip,
    dateOfBirth: user.dateOfBirth,
    status: user.status,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

function seedStore(): BankStore {
  const usedNumbers = new Set<string>();
  const adminId = "admin-elena-vasquez";
  const mariaId = "member-maria-okonkwo";
  const jamesId = "member-james-whitfield";
  const aminaId = "member-amina-cole";

  const users: User[] = [
    {
      id: adminId,
      role: "admin",
      email: DEMO_ADMIN.email,
      passwordHash: hashPassword(DEMO_ADMIN.password),
      firstName: "Elena",
      lastName: "Vasquez",
      phone: "(404) 555-0148",
      address: "120 Ridge Plaza",
      city: "Savannah",
      state: "GA",
      zip: "31401",
      dateOfBirth: "1984-03-12",
      status: "active",
      createdAt: daysAgo(420, 9),
      lastLoginAt: null,
    },
    {
      id: mariaId,
      role: "member",
      email: DEMO_MEMBER.email,
      passwordHash: hashPassword(DEMO_MEMBER.password),
      firstName: "Maria",
      lastName: "Okonkwo",
      phone: "(912) 555-0194",
      address: "48 Magnolia Court",
      city: "Savannah",
      state: "GA",
      zip: "31405",
      dateOfBirth: "1991-07-22",
      status: "active",
      createdAt: daysAgo(210, 11),
      lastLoginAt: daysAgo(1, 8),
    },
    {
      id: jamesId,
      role: "member",
      email: "james.whitfield@email.com",
      passwordHash: hashPassword(DEMO_MEMBER.password),
      firstName: "James",
      lastName: "Whitfield",
      phone: "(706) 555-0172",
      address: "901 Broad Street",
      city: "Augusta",
      state: "GA",
      zip: "30901",
      dateOfBirth: "1978-11-03",
      status: "active",
      createdAt: daysAgo(140, 14),
      lastLoginAt: daysAgo(4, 16),
    },
    {
      id: aminaId,
      role: "member",
      email: "amina.cole@email.com",
      passwordHash: hashPassword(DEMO_MEMBER.password),
      firstName: "Amina",
      lastName: "Cole",
      phone: "(229) 555-0133",
      address: "17 Peachtree Walk",
      city: "Albany",
      state: "GA",
      zip: "31701",
      dateOfBirth: "1996-02-18",
      status: "frozen",
      createdAt: daysAgo(38, 10),
      lastLoginAt: daysAgo(12, 19),
    },
  ];

  const accounts: Account[] = [
    {
      id: "acct-maria-checking",
      userId: mariaId,
      type: "checking",
      name: "Everyday Checking",
      accountNumber: generateAccountNumber(usedNumbers),
      routingNumber: BANK_ROUTING,
      balanceCents: 425040,
      status: "active",
      openedAt: daysAgo(210, 11),
    },
    {
      id: "acct-maria-savings",
      userId: mariaId,
      type: "savings",
      name: "Ridge Savings",
      accountNumber: generateAccountNumber(usedNumbers),
      routingNumber: BANK_ROUTING,
      balanceCents: 1289000,
      status: "active",
      openedAt: daysAgo(200, 13),
    },
    {
      id: "acct-james-checking",
      userId: jamesId,
      type: "checking",
      name: "Everyday Checking",
      accountNumber: generateAccountNumber(usedNumbers),
      routingNumber: BANK_ROUTING,
      balanceCents: 110218,
      status: "active",
      openedAt: daysAgo(140, 14),
    },
    {
      id: "acct-james-business",
      userId: jamesId,
      type: "business",
      name: "Whitfield Provisions",
      accountNumber: generateAccountNumber(usedNumbers),
      routingNumber: BANK_ROUTING,
      balanceCents: 2845000,
      status: "active",
      openedAt: daysAgo(130, 9),
    },
    {
      id: "acct-amina-checking",
      userId: aminaId,
      type: "checking",
      name: "Everyday Checking",
      accountNumber: generateAccountNumber(usedNumbers),
      routingNumber: BANK_ROUTING,
      balanceCents: 89055,
      status: "frozen",
      openedAt: daysAgo(38, 10),
    },
    {
      id: "acct-amina-savings",
      userId: aminaId,
      type: "savings",
      name: "Ridge Savings",
      accountNumber: generateAccountNumber(usedNumbers),
      routingNumber: BANK_ROUTING,
      balanceCents: 320000,
      status: "frozen",
      openedAt: daysAgo(38, 10),
    },
  ];

  const tx = (
    accountId: string,
    type: TransactionType,
    amountCents: number,
    balanceAfterCents: number,
    description: string,
    createdAt: string,
    counterparty: string | null = null,
  ): Transaction => ({
    id: createId(),
    accountId,
    type,
    amountCents,
    balanceAfterCents,
    description,
    counterparty,
    createdAt,
    createdBy: "system",
  });

  const transactions: Transaction[] = [
    tx(
      "acct-maria-checking",
      "credit",
      245000,
      425040,
      "Payroll — Harbor Clinic",
      daysAgo(2, 7),
      "Harbor Clinic",
    ),
    tx(
      "acct-maria-checking",
      "debit",
      -6840,
      180040,
      "Kroger #441",
      daysAgo(3, 18),
      "Kroger",
    ),
    tx(
      "acct-maria-checking",
      "debit",
      -12800,
      186880,
      "Georgia Power",
      daysAgo(5, 6),
      "Georgia Power",
    ),
    tx(
      "acct-maria-savings",
      "credit",
      25000,
      1289000,
      "Transfer from Everyday Checking",
      daysAgo(8, 12),
      "Everyday Checking",
    ),
    tx(
      "acct-james-business",
      "credit",
      186500,
      2845000,
      "Invoice 1842 — Coastal Grocers",
      daysAgo(1, 15),
      "Coastal Grocers",
    ),
    tx(
      "acct-james-checking",
      "debit",
      -4200,
      110218,
      "Shell Oil",
      daysAgo(2, 17),
      "Shell",
    ),
    tx(
      "acct-amina-checking",
      "debit",
      -2200,
      89055,
      "Savannah Transit",
      daysAgo(12, 9),
      "Savannah Transit",
    ),
  ];

  return { users, accounts, transactions };
}

function ensureStore() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, JSON.stringify(seedStore(), null, 2));
  }
}

function readStore(): BankStore {
  ensureStore();
  return JSON.parse(readFileSync(DATA_FILE, "utf8")) as BankStore;
}

function writeStore(store: BankStore) {
  ensureStore();
  writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

export function getStore() {
  return withLock(() => readStore());
}

export function getPublicUserById(id: string) {
  return withLock(() => {
    const user = readStore().users.find((item) => item.id === id);
    return user ? publicUser(user) : null;
  });
}

export function getUserByEmail(email: string) {
  return withLock(() => {
    const normalized = email.trim().toLowerCase();
    return (
      readStore().users.find(
        (user) => user.email.toLowerCase() === normalized,
      ) ?? null
    );
  });
}

export function recordLogin(userId: string) {
  return withLock(() => {
    const store = readStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user) return null;
    user.lastLoginAt = now();
    writeStore(store);
    return publicUser(user);
  });
}

export function listMembers() {
  return withLock(() => {
    const store = readStore();
    return store.users
      .filter((user) => user.role === "member")
      .map((user) => ({
        ...publicUser(user),
        accounts: store.accounts.filter((account) => account.userId === user.id),
        totalCents: store.accounts
          .filter((account) => account.userId === user.id)
          .reduce((sum, account) => sum + account.balanceCents, 0),
      }))
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  });
}

export function getMemberDetail(userId: string) {
  return withLock(() => {
    const store = readStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user) return null;
    const accounts = store.accounts.filter(
      (account) => account.userId === user.id,
    );
    const accountIds = new Set(accounts.map((account) => account.id));
    const transactions = store.transactions
      .filter((item) => accountIds.has(item.accountId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return {
      user: publicUser(user),
      accounts,
      transactions,
      totalCents: accounts.reduce(
        (sum, account) => sum + account.balanceCents,
        0,
      ),
    };
  });
}

export function getMemberBanking(userId: string) {
  return getMemberDetail(userId);
}

export function createMember(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dateOfBirth: string;
}) {
  return withLock(() => {
    const store = readStore();
    const email = input.email.trim().toLowerCase();
    if (store.users.some((user) => user.email.toLowerCase() === email)) {
      throw new Error("An account already exists for that email.");
    }

    const used = new Set(store.accounts.map((account) => account.accountNumber));
    const user: User = {
      id: createId(),
      role: "member",
      email,
      passwordHash: hashPassword(input.password),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      city: input.city.trim(),
      state: input.state.trim().toUpperCase(),
      zip: input.zip.trim(),
      dateOfBirth: input.dateOfBirth,
      status: "active",
      createdAt: now(),
      lastLoginAt: null,
    };

    const checking: Account = {
      id: createId(),
      userId: user.id,
      type: "checking",
      name: "Everyday Checking",
      accountNumber: generateAccountNumber(used),
      routingNumber: BANK_ROUTING,
      balanceCents: 0,
      status: "active",
      openedAt: now(),
    };
    const savings: Account = {
      id: createId(),
      userId: user.id,
      type: "savings",
      name: "Ridge Savings",
      accountNumber: generateAccountNumber(used),
      routingNumber: BANK_ROUTING,
      balanceCents: 0,
      status: "active",
      openedAt: now(),
    };

    store.users.push(user);
    store.accounts.push(checking, savings);
    writeStore(store);
    return { user: publicUser(user), accounts: [checking, savings] };
  });
}

export function updateMember(
  userId: string,
  patch: Partial<
    Pick<
      User,
      | "firstName"
      | "lastName"
      | "email"
      | "phone"
      | "address"
      | "city"
      | "state"
      | "zip"
      | "dateOfBirth"
      | "status"
    >
  >,
) {
  return withLock(() => {
    const store = readStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user || user.role !== "member") {
      throw new Error("Member not found.");
    }
    if (patch.email) {
      const email = patch.email.trim().toLowerCase();
      if (
        store.users.some(
          (item) => item.id !== userId && item.email.toLowerCase() === email,
        )
      ) {
        throw new Error("Another member already uses that email.");
      }
      user.email = email;
    }
    if (patch.firstName !== undefined) user.firstName = patch.firstName.trim();
    if (patch.lastName !== undefined) user.lastName = patch.lastName.trim();
    if (patch.phone !== undefined) user.phone = patch.phone.trim();
    if (patch.address !== undefined) user.address = patch.address.trim();
    if (patch.city !== undefined) user.city = patch.city.trim();
    if (patch.state !== undefined) user.state = patch.state.trim().toUpperCase();
    if (patch.zip !== undefined) user.zip = patch.zip.trim();
    if (patch.dateOfBirth !== undefined) user.dateOfBirth = patch.dateOfBirth;
    if (patch.status !== undefined) {
      user.status = patch.status;
      if (patch.status === "frozen" || patch.status === "closed") {
        for (const account of store.accounts.filter(
          (item) => item.userId === userId,
        )) {
          account.status = patch.status;
        }
      }
      if (patch.status === "active") {
        for (const account of store.accounts.filter(
          (item) => item.userId === userId,
        )) {
          if (account.status === "frozen") account.status = "active";
        }
      }
    }
    writeStore(store);
    return publicUser(user);
  });
}

export function setMemberPassword(userId: string, password: string) {
  return withLock(() => {
    const store = readStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user) throw new Error("Member not found.");
    user.passwordHash = hashPassword(password);
    writeStore(store);
  });
}

export function openAccount(userId: string, type: AccountType, name: string) {
  return withLock(() => {
    const store = readStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user || user.role !== "member") {
      throw new Error("Member not found.");
    }
    const used = new Set(store.accounts.map((account) => account.accountNumber));
    const account: Account = {
      id: createId(),
      userId,
      type,
      name: name.trim() || defaultAccountName(type),
      accountNumber: generateAccountNumber(used),
      routingNumber: BANK_ROUTING,
      balanceCents: 0,
      status: user.status === "frozen" ? "frozen" : "active",
      openedAt: now(),
    };
    store.accounts.push(account);
    writeStore(store);
    return account;
  });
}

export function updateAccountStatus(accountId: string, status: AccountStatus) {
  return withLock(() => {
    const store = readStore();
    const account = store.accounts.find((item) => item.id === accountId);
    if (!account) throw new Error("Account not found.");
    account.status = status;
    writeStore(store);
    return account;
  });
}

export function adjustBalance(input: {
  accountId: string;
  mode: "credit" | "debit" | "set";
  amountCents: number;
  description: string;
  createdBy: string;
}) {
  return withLock(() => {
    const store = readStore();
    const account = store.accounts.find((item) => item.id === input.accountId);
    if (!account) throw new Error("Account not found.");
    if (input.amountCents < 0) throw new Error("Amount must be positive.");

    let nextBalance = account.balanceCents;
    let amountCents = 0;
    let type: TransactionType = "adjustment";

    if (input.mode === "set") {
      amountCents = input.amountCents - account.balanceCents;
      nextBalance = input.amountCents;
      type = "adjustment";
    } else if (input.mode === "credit") {
      amountCents = input.amountCents;
      nextBalance = account.balanceCents + input.amountCents;
      type = "credit";
    } else {
      amountCents = -input.amountCents;
      nextBalance = account.balanceCents - input.amountCents;
      type = "debit";
    }

    account.balanceCents = nextBalance;
    const transaction: Transaction = {
      id: createId(),
      accountId: account.id,
      type,
      amountCents,
      balanceAfterCents: nextBalance,
      description: input.description.trim() || "Balance adjustment",
      counterparty: "Southern Ridge UDC Operations",
      createdAt: now(),
      createdBy: input.createdBy,
    };
    store.transactions.unshift(transaction);
    writeStore(store);
    return { account, transaction };
  });
}

export function transferFunds(input: {
  fromAccountId: string;
  toAccountId?: string;
  toAccountNumber?: string;
  amountCents: number;
  memo: string;
  actorId: string;
}) {
  return withLock(() => {
    const store = readStore();
    const from = store.accounts.find((item) => item.id === input.fromAccountId);
    if (!from) throw new Error("Source account not found.");
    if (from.status !== "active") {
      throw new Error("The source account is not available for transfers.");
    }
    if (input.amountCents <= 0) throw new Error("Enter an amount greater than zero.");
    if (from.balanceCents < input.amountCents) {
      throw new Error("Insufficient funds.");
    }

    let to: Account | undefined;
    if (input.toAccountId) {
      to = store.accounts.find((item) => item.id === input.toAccountId);
    } else if (input.toAccountNumber) {
      const digits = input.toAccountNumber.replace(/\D/g, "");
      to = store.accounts.find((item) => item.accountNumber === digits);
    }
    if (!to) throw new Error("Destination account was not found.");
    if (to.id === from.id) {
      throw new Error("Choose a different destination account.");
    }
    if (to.status !== "active") {
      throw new Error("The destination account cannot receive transfers.");
    }

    const fromOwner = store.users.find((user) => user.id === from.userId);
    const toOwner = store.users.find((user) => user.id === to.userId);
    from.balanceCents -= input.amountCents;
    to.balanceCents += input.amountCents;

    const memo = input.memo.trim() || "Member transfer";
    store.transactions.unshift({
      id: createId(),
      accountId: from.id,
      type: "transfer_out",
      amountCents: -input.amountCents,
      balanceAfterCents: from.balanceCents,
      description: memo,
      counterparty: toOwner
        ? `${toOwner.firstName} ${toOwner.lastName} ${to.name}`
        : to.name,
      createdAt: now(),
      createdBy: input.actorId,
    });
    store.transactions.unshift({
      id: createId(),
      accountId: to.id,
      type: "transfer_in",
      amountCents: input.amountCents,
      balanceAfterCents: to.balanceCents,
      description: memo,
      counterparty: fromOwner
        ? `${fromOwner.firstName} ${fromOwner.lastName} ${from.name}`
        : from.name,
      createdAt: now(),
      createdBy: input.actorId,
    });
    writeStore(store);
    return { from, to };
  });
}

function defaultAccountName(type: AccountType) {
  if (type === "checking") return "Everyday Checking";
  if (type === "savings") return "Ridge Savings";
  return "Business Operating";
}

export function adminSnapshot() {
  return withLock(() => {
    const store = readStore();
    const members = store.users.filter((user) => user.role === "member");
    const deposits = store.accounts.reduce(
      (sum, account) => sum + account.balanceCents,
      0,
    );
    return {
      memberCount: members.length,
      activeMembers: members.filter((member) => member.status === "active")
        .length,
      frozenMembers: members.filter((member) => member.status === "frozen")
        .length,
      deposits,
      accountCount: store.accounts.length,
      recentTransactions: store.transactions
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 8),
    };
  });
}
