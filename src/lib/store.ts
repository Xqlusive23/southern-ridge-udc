import "server-only";

import { BANK_NAME, BANK_ROUTING, BANK_SHORT, DEMO_ADMIN } from "@/lib/constants";
import { loadPersistedJson, savePersistedJson } from "@/lib/persist";
import {
  enqueueTransactionMail,
  extractEmail,
  flushTransactionMail,
} from "@/lib/mail";
import { hashPassword, verifyPassword } from "@/lib/passwords";
import { normalizeCurrency, normalizeLocale } from "@/lib/i18n";
import type {
  Account,
  AccountStatus,
  AccountType,
  BankSettings,
  BankStore,
  CardStatus,
  ContactChannel,
  DebitCard,
  Loan,
  LoanStatus,
  LoanType,
  OutgoingPolicy,
  MemberContact,
  PublicUser,
  Transaction,
  TransactionType,
  TransferKind,
  TransferRequest,
  TransferStatus,
  User,
} from "@/lib/types";

let writeChain: Promise<unknown> = Promise.resolve();
let cache: BankStore | null = null;
let hydrate: Promise<void> | null = null;
let dirty = false;
let persistBlocked = false;

function withLock<T>(fn: () => T): Promise<T> {
  const run = writeChain.then(async () => {
    cache = null;
    hydrate = null;
    persistBlocked = false;
    dirty = false;
    await hydrateStore();
    const result = fn();
    if (cache && dirty && !persistBlocked) {
      await savePersistedJson(JSON.stringify(cache, null, 2));
      dirty = false;
    }
    return result;
  });
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

function defaultSettings(): BankSettings {
  return {
    institutionName: BANK_NAME,
    branchName: "Main office",
    address: "120 Ridge Plaza",
    city: "Savannah",
    state: "GA",
    zip: "31401",
    hours: "Weekdays 9:00–5:00",
    phone: "(912) 555-0180",
    email: "hello@southernridgeudc.com",
    memberDeskPhone: "(912) 555-0180",
    memberDeskEmail: "members@southernridgeudc.com",
    afterHoursPhone: "(912) 555-0199",
    requireTransferPin: true,
    allowMemberPinChange: true,
    defaultStatementDelivery: "email",
    operationsNote: "",
    smartsuppKey: "9d3055436f4fe983acee7e2e127f491e7d797b8c",
    supportEmail: "members@southernridgeudc.com",
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
  };
}

function contactsFromProfile(user: Pick<User, "phone" | "email" | "address" | "city" | "state" | "zip">): MemberContact[] {
  const contacts: MemberContact[] = [];
  if (user.phone) {
    contacts.push({
      id: createId(),
      channel: "mobile",
      label: "Mobile",
      value: user.phone,
      isPrimary: true,
    });
  }
  if (user.email) {
    contacts.push({
      id: createId(),
      channel: "email",
      label: "Primary email",
      value: user.email,
      isPrimary: contacts.length === 0,
    });
  }
  const mailing = [user.address, [user.city, user.state, user.zip].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join(", ");
  if (mailing) {
    contacts.push({
      id: createId(),
      channel: "mail",
      label: "Mailing address",
      value: mailing,
      isPrimary: contacts.length === 0,
    });
  }
  return contacts;
}

function normalizeUser(user: User): User {
  return {
    ...user,
    transferPinHash: user.transferPinHash ?? null,
    preferredContact: user.preferredContact ?? "mobile",
    defaultOutgoingStatus: user.defaultOutgoingStatus ?? "pending",
    contacts:
      Array.isArray(user.contacts) && user.contacts.length > 0
        ? user.contacts
        : contactsFromProfile(user),
    readNotificationIds: Array.isArray(user.readNotificationIds)
      ? user.readNotificationIds
      : [],
    photoPath: user.photoPath ?? null,
    locale: normalizeLocale(user.locale),
    currency: normalizeCurrency(user.currency),
  };
}

function cardEligible(type: AccountType) {
  return type === "checking" || type === "business";
}

function generatePan(used: Set<string>) {
  let pan = "";
  do {
    pan = `4532${Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("")}`;
  } while (used.has(pan));
  used.add(pan);
  return pan;
}

function generateCvv() {
  return String(Math.floor(100 + Math.random() * 900));
}

function issueCard(store: BankStore, account: Account, user: User): DebitCard {
  const used = new Set(store.cards.map((card) => card.pan));
  const nowDate = new Date();
  const card: DebitCard = {
    id: createId(),
    userId: user.id,
    accountId: account.id,
    pan: generatePan(used),
    cvv: generateCvv(),
    expiryMonth: nowDate.getMonth() + 1,
    expiryYear: nowDate.getFullYear() + 4,
    holderName: `${user.firstName} ${user.lastName}`.trim().toUpperCase(),
    kind: account.type === "business" ? "business" : "debit",
    status: account.status === "active" ? "active" : "frozen",
    createdAt: account.openedAt || now(),
  };
  store.cards.push(card);
  return card;
}

function ensureAccountCards(store: BankStore) {
  const users = new Map(store.users.map((user) => [user.id, user]));
  for (const account of store.accounts) {
    if (!cardEligible(account.type)) continue;
    if (store.cards.some((card) => card.accountId === account.id && card.status !== "closed")) {
      continue;
    }
    const user = users.get(account.userId);
    if (user && user.role === "member") {
      issueCard(store, account, user);
    }
  }
}

function syncCardsForAccount(store: BankStore, account: Account) {
  for (const card of store.cards.filter((item) => item.accountId === account.id)) {
    if (card.status === "closed") continue;
    if (account.status === "closed") card.status = "closed";
    else if (account.status === "frozen") card.status = "frozen";
    else if (account.status === "active" && card.status === "frozen") {
      card.status = "active";
    }
  }
}

function storeNeedsMigration(raw: Partial<BankStore>) {
  if (!raw.settings || !raw.transfers || !raw.loans || !Array.isArray(raw.cards)) return true;
  const issued = new Set((raw.cards ?? []).map((card) => card.accountId));
  if ((raw.accounts ?? []).some((account) => cardEligible(account.type) && !issued.has(account.id))) {
    return true;
  }
  return (raw.users ?? []).some(
    (user) =>
      !Array.isArray(user.contacts) ||
      user.transferPinHash === undefined ||
      user.defaultOutgoingStatus === undefined,
  );
}

function normalizeTransaction(item: Transaction): Transaction {
  return {
    ...item,
    status: item.status ?? "completed",
    transferId: item.transferId ?? null,
  };
}

function normalizeStore(raw: Partial<BankStore>): BankStore {
  const store: BankStore = {
    users: (raw.users ?? []).map(normalizeUser),
    accounts: (raw.accounts ?? []).map((account) => ({
      ...account,
      name: account.name === "Everyday Checking" ? "Checking" : account.name,
    })),
    cards: raw.cards ?? [],
    transactions: (raw.transactions ?? []).map(normalizeTransaction),
    transfers: raw.transfers ?? [],
    loans: raw.loans ?? [],
    settings: { ...defaultSettings(), ...raw.settings },
  };
  ensureAccountCards(store);
  return store;
}

function publicUser(user: User): PublicUser {
  const normalized = normalizeUser(user);
  return {
    id: normalized.id,
    role: normalized.role,
    email: normalized.email,
    firstName: normalized.firstName,
    lastName: normalized.lastName,
    phone: normalized.phone,
    address: normalized.address,
    city: normalized.city,
    state: normalized.state,
    zip: normalized.zip,
    dateOfBirth: normalized.dateOfBirth,
    status: normalized.status,
    preferredContact: normalized.preferredContact,
    defaultOutgoingStatus: normalized.defaultOutgoingStatus,
    contacts: normalized.contacts,
    createdAt: normalized.createdAt,
    lastLoginAt: normalized.lastLoginAt,
    hasTransferPin: Boolean(normalized.transferPinHash),
    readNotificationIds: normalized.readNotificationIds,
    photoPath: normalized.photoPath,
    locale: normalized.locale,
    currency: normalized.currency,
  };
}

function assertTransferPin(pin: string) {
  if (!/^\d{4,6}$/.test(pin.trim())) {
    throw new Error("Transfer PIN must be 4 to 6 digits.");
  }
}

function syncPrimaryContact(user: User, contact: MemberContact) {
  if (!contact.isPrimary) return;
  user.preferredContact = contact.channel;
  if (contact.channel === "mobile" || contact.channel === "home" || contact.channel === "work" || contact.channel === "sms") {
    user.phone = contact.value;
  }
  if (contact.channel === "mail") {
    user.address = contact.value;
  }
}

function seedStore(): BankStore {
  const admin: User = {
    id: "admin-elena-vasquez",
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
    transferPinHash: null,
    defaultOutgoingStatus: "pending",
    preferredContact: "email",
    contacts: [],
    createdAt: daysAgo(420, 9),
    lastLoginAt: null,
    readNotificationIds: [],
    photoPath: null,
    locale: "en",
    currency: "USD",
  };
  admin.contacts = contactsFromProfile(admin);
  return {
    users: [admin],
    accounts: [],
    cards: [],
    transactions: [],
    transfers: [],
    loans: [],
    settings: defaultSettings(),
  };
}

async function hydrateStore() {
  if (cache) return;
  if (!hydrate) {
    hydrate = (async () => {
      try {
        const loaded = await loadPersistedJson();
        if (loaded.status === "loaded") {
          try {
            const parsed = JSON.parse(loaded.json) as Partial<BankStore>;
            const renamedChecking = (parsed.accounts ?? []).some(
              (account) => account.name === "Everyday Checking",
            );
            cache = normalizeStore(parsed);
            if (renamedChecking) dirty = true;
          } catch {
            throw new Error(
              "The membership ledger could not be read. Please try again in a moment.",
            );
          }
          persistBlocked = !loaded.durable;
          return;
        }
        if (loaded.status === "unavailable") {
          throw new Error(
            "The membership ledger is temporarily unavailable. Please try again in a moment.",
          );
        }
        cache = seedStore();
        persistBlocked = false;
        dirty = true;
      } catch (error) {
        hydrate = null;
        throw error;
      }
    })();
  }
  await hydrate;
}

function readStore(): BankStore {
  if (!cache) throw new Error("Bank store is not ready.");
  return cache;
}

function recordTransaction(
  store: BankStore,
  transaction: Transaction,
  extraEmails: string[] = [],
  receivingBankName = "",
) {
  store.transactions.unshift(transaction);
  const account = store.accounts.find((item) => item.id === transaction.accountId);
  const owner = account
    ? store.users.find((user) => user.id === account.userId)
    : undefined;
  const ownerEmail = owner ? extractEmail(owner.email).toLowerCase() : "";
  const senderName = owner ? `${owner.firstName} ${owner.lastName}`.trim() : "";
  const recipients = new Set<string>();
  if (owner?.role === "member" && ownerEmail) {
    recipients.add(ownerEmail);
  }
  for (const value of extraEmails) {
    const email = extractEmail(value).toLowerCase();
    if (email) recipients.add(email);
  }
  for (const to of recipients) {
    const isOwner = Boolean(ownerEmail && ownerEmail === to);
    const audienceUser = isOwner
      ? owner
      : store.users.find((user) => user.email.toLowerCase() === to);
    enqueueTransactionMail({
      to,
      toName: isOwner && owner
        ? `${owner.firstName} ${owner.lastName}`
        : transaction.counterparty || "Member",
      settings: store.settings,
      transaction,
      account: isOwner ? account : undefined,
      audience: isOwner ? "member" : "recipient",
      receivingBankName,
      senderName,
      locale: audienceUser?.locale,
      currency: audienceUser?.currency,
    });
  }
}

function writeStore(store: BankStore) {
  cache = store;
  dirty = true;
  flushTransactionMail();
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
      .map((user) => {
        const outgoing = store.transfers
          .filter((item) => item.userId === user.id && item.status !== "rejected")
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        return {
          ...publicUser(user),
          accounts: store.accounts.filter((account) => account.userId === user.id),
          totalCents: store.accounts
            .filter((account) => account.userId === user.id)
            .reduce((sum, account) => sum + account.balanceCents, 0),
          outgoingStatus: user.defaultOutgoingStatus ?? "pending",
          openTransferCount: outgoing.filter((item) => item.status !== "completed").length,
        };
      })
      .sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (b.status === "pending" && a.status !== "pending") return 1;
        return a.lastName.localeCompare(b.lastName);
      });
  });
}

export function listMemberOutgoingIds(userId: string) {
  return withLock(() =>
    readStore()
      .transfers.filter((item) => item.userId === userId && item.status !== "rejected")
      .map((item) => item.id),
  );
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
      cards: store.cards
        .filter((card) => card.userId === user.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      transactions,
      transfers: store.transfers
        .filter((item) => item.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      loans: store.loans
        .filter((item) => item.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
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
  status?: User["status"];
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
      status: input.status ?? "active",
      transferPinHash: null,
      defaultOutgoingStatus: "pending",
      preferredContact: "mobile",
      contacts: [],
      createdAt: now(),
      lastLoginAt: null,
      readNotificationIds: [],
      photoPath: null,
      locale: "en",
      currency: "USD",
    };
    user.contacts = contactsFromProfile(user);

    const checking: Account = {
      id: createId(),
      userId: user.id,
      type: "checking",
      name: "Checking",
      accountNumber: generateAccountNumber(used),
      routingNumber: BANK_ROUTING,
      balanceCents: 0,
      status: user.status === "pending" ? "frozen" : "active",
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
      status: user.status === "pending" ? "frozen" : "active",
      openedAt: now(),
    };

    store.users.push(user);
    store.accounts.push(checking, savings);
    issueCard(store, checking, user);
    writeStore(store);
    return { user: publicUser(user), accounts: [checking, savings] };
  });
}

export function markNotificationsRead(userId: string, ids: string[]) {
  return withLock(() => {
    const store = readStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user) throw new Error("Member not found.");
    const current = new Set(normalizeUser(user).readNotificationIds);
    for (const id of ids) current.add(id);
    user.readNotificationIds = [...current];
    writeStore(store);
    return publicUser(user);
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
      | "preferredContact"
      | "locale"
      | "currency"
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
    if (patch.preferredContact !== undefined) {
      user.preferredContact = patch.preferredContact;
    }
    if (patch.locale !== undefined) user.locale = normalizeLocale(patch.locale);
    if (patch.currency !== undefined) user.currency = normalizeCurrency(patch.currency);
    writeStore(store);
    return publicUser(user);
  });
}

export function setMemberPhoto(userId: string, photoPath: string | null) {
  return withLock(() => {
    const store = readStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user || user.role !== "member") {
      throw new Error("Member not found.");
    }
    user.photoPath = photoPath;
    writeStore(store);
    return publicUser(user);
  });
}

export function setMemberAccess(userId: string, status: User["status"]) {
  return withLock(() => {
    const store = readStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user || user.role !== "member") {
      throw new Error("Member not found.");
    }
    user.status = status;
    if (status === "frozen" || status === "pending" || status === "closed" || status === "banned") {
      for (const account of store.accounts.filter((item) => item.userId === userId)) {
        account.status = status === "banned" || status === "pending" ? "frozen" : status;
        syncCardsForAccount(store, account);
      }
    }
    if (status === "active") {
      for (const account of store.accounts.filter((item) => item.userId === userId)) {
        if (account.status === "frozen") account.status = "active";
        syncCardsForAccount(store, account);
      }
    }
    writeStore(store);
    return publicUser(user);
  });
}

export function setMemberOutgoingPolicy(userId: string, status: OutgoingPolicy) {
  return withLock(() => {
    const store = readStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user || user.role !== "member") throw new Error("Member not found.");
    user.defaultOutgoingStatus = status;
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
    if (cardEligible(type)) {
      issueCard(store, account, user);
    }
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
    syncCardsForAccount(store, account);
    writeStore(store);
    return account;
  });
}

export function setDebitCardStatus(cardId: string, status: CardStatus, actorId: string) {
  return withLock(() => {
    const store = readStore();
    const card = store.cards.find((item) => item.id === cardId);
    if (!card) throw new Error("Card not found.");
    if (card.userId !== actorId) {
      throw new Error("That card does not belong to you.");
    }
    const user = store.users.find((item) => item.id === actorId);
    const account = store.accounts.find((item) => item.id === card.accountId);
    if (!user || !account) throw new Error("Card not found.");
    if (card.status === "closed") {
      throw new Error("This card has been closed.");
    }
    if (status === "active") {
      if (user.status !== "active") {
        throw new Error("This membership cannot turn a card back on right now.");
      }
      if (account.status !== "active") {
        throw new Error("Unfreeze the linked account before turning this card on.");
      }
    }
    card.status = status;
    writeStore(store);
    return card;
  });
}

export function adjustBalance(input: {
  accountId: string;
  mode: "credit" | "debit" | "set";
  amountCents: number;
  description: string;
  createdBy: string;
  createdAt?: string;
  counterparty?: string;
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
      counterparty: input.counterparty?.trim() || "Southern Ridge UDC Operations",
      createdAt: input.createdAt || now(),
      createdBy: input.createdBy,
      status: "completed",
      transferId: null,
    };
    recordTransaction(store,transaction);
    writeStore(store);
    return { account, transaction };
  });
}

function isSouthernRidgeBank(name: string) {
  const needle = name.trim().toLowerCase();
  return (
    needle === BANK_NAME.toLowerCase() ||
    needle === BANK_SHORT.toLowerCase() ||
    needle.includes("southern ridge")
  );
}

function assertMemberCanMoveMoney(user: User | undefined) {
  if (!user || user.role !== "member") throw new Error("Member not found.");
  if (user.status === "banned") {
    throw new Error("This membership is banned. Login and transfers are restricted.");
  }
  if (user.status === "frozen" || user.status === "pending" || user.status === "closed") {
    throw new Error("This membership cannot send money right now.");
  }
}

export function transferFunds(input: {
  fromAccountId: string;
  toAccountId?: string;
  toAccountNumber?: string;
  recipientName?: string;
  recipientDetails?: string;
  amountCents: number;
  memo: string;
  actorId: string;
}) {
  return createOutgoingTransfer({
    ...input,
    kind: input.toAccountNumber ? "member" : "internal",
  });
}

export function createOutgoingTransfer(input: {
  fromAccountId: string;
  toAccountId?: string;
  toAccountNumber?: string;
  recipientName?: string;
  recipientDetails?: string;
  amountCents: number;
  memo: string;
  actorId: string;
  kind: TransferKind;
}) {
  return withLock(() => {
    const store = readStore();
    const from = store.accounts.find((item) => item.id === input.fromAccountId);
    if (!from) throw new Error("Source account not found.");
    if (from.status !== "active") {
      throw new Error("The source account is not available for transfers.");
    }
    const owner = store.users.find((user) => user.id === from.userId);
    assertMemberCanMoveMoney(owner);
    if (from.userId !== input.actorId) {
      throw new Error("That account does not belong to you.");
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

    const externalBank =
      Boolean(input.recipientDetails?.trim()) &&
      !to &&
      !isSouthernRidgeBank(input.recipientDetails ?? "");
    if (input.kind === "internal" || (input.kind === "member" && !externalBank)) {
      if (!to) throw new Error("Destination account was not found.");
      if (to.id === from.id) {
        throw new Error("Choose a different destination account.");
      }
      if (to.status !== "active") {
        throw new Error("The destination account cannot receive transfers.");
      }
    }

    const sameOwner = Boolean(to && to.userId === from.userId);
    const policy = owner?.defaultOutgoingStatus ?? "pending";
    const completeNow =
      (input.kind === "internal" && sameOwner) ||
      (policy === "completed" && input.kind !== "internal");
    const initialStatus: TransferStatus =
      input.kind === "internal" && sameOwner
        ? "completed"
        : policy;
    const toOwner = to ? store.users.find((user) => user.id === to.userId) : null;
    const recipientName =
      input.recipientName?.trim() ||
      (toOwner ? `${toOwner.firstName} ${toOwner.lastName}` : to?.name || "Recipient");
    const memo = input.memo.trim() || defaultTransferMemo(input.kind);

    from.balanceCents -= input.amountCents;
    const debitId = createId();
    const transferId = createId();
    const timestamp = now();

    const firstDetail = (input.recipientDetails ?? "").split("·")[0]?.trim() ?? "";
    const receivingBankName =
      firstDetail && !/@/.test(firstDetail) && !/^\d+$/.test(firstDetail)
        ? firstDetail
        : "";
    recordTransaction(
      store,
      {
        id: debitId,
        accountId: from.id,
        type: "transfer_out",
        amountCents: -input.amountCents,
        balanceAfterCents: from.balanceCents,
        description: memo,
        counterparty: recipientName,
        createdAt: timestamp,
        createdBy: input.actorId,
        status: initialStatus,
        transferId,
      },
      [input.recipientDetails ?? ""],
      receivingBankName,
    );

    let creditId: string | null = null;
    if (completeNow && to) {
      to.balanceCents += input.amountCents;
      creditId = createId();
      recordTransaction(store,{
        id: creditId,
        accountId: to.id,
        type: "transfer_in",
        amountCents: input.amountCents,
        balanceAfterCents: to.balanceCents,
        description: memo,
        counterparty: owner ? `${owner.firstName} ${owner.lastName} ${from.name}` : from.name,
        createdAt: timestamp,
        createdBy: input.actorId,
        status: "completed",
        transferId,
      });
    }

    const request: TransferRequest = {
      id: transferId,
      userId: from.userId,
      fromAccountId: from.id,
      toAccountId: to?.id ?? null,
      toAccountNumber: input.toAccountNumber?.replace(/\D/g, "") || to?.accountNumber || null,
      recipientName,
      recipientDetails: input.recipientDetails?.trim() || "",
      amountCents: input.amountCents,
      memo,
      kind: input.kind,
      status: initialStatus,
      createdAt: timestamp,
      updatedAt: timestamp,
      reviewedBy: null,
      reviewNote: "",
      debitTransactionId: debitId,
      creditTransactionId: creditId,
    };
    store.transfers.unshift(request);
    writeStore(store);
    return request;
  });
}

export function createMobileDeposit(input: {
  userId: string;
  accountId: string;
  amountCents: number;
  memo: string;
}) {
  return withLock(() => {
    const store = readStore();
    const user = store.users.find((item) => item.id === input.userId);
    assertMemberCanMoveMoney(user);
    const account = store.accounts.find((item) => item.id === input.accountId);
    if (!account || account.userId !== input.userId) {
      throw new Error("Choose one of your accounts.");
    }
    if (account.status !== "active") {
      throw new Error("That account cannot receive a mobile deposit.");
    }
    if (input.amountCents <= 0) throw new Error("Enter an amount greater than zero.");

    const timestamp = now();
    const policy = user!.defaultOutgoingStatus ?? "pending";
    let creditId: string | null = null;
    if (policy === "completed") {
      account.balanceCents += input.amountCents;
      creditId = createId();
      recordTransaction(store,{
        id: creditId,
        accountId: account.id,
        type: "credit",
        amountCents: input.amountCents,
        balanceAfterCents: account.balanceCents,
        description: input.memo.trim() || "Mobile check deposit",
        counterparty: "Mobile deposit",
        createdAt: timestamp,
        createdBy: input.userId,
        status: "completed",
        transferId: null,
      });
    }
    const request: TransferRequest = {
      id: createId(),
      userId: input.userId,
      fromAccountId: account.id,
      toAccountId: account.id,
      toAccountNumber: account.accountNumber,
      recipientName: `${user!.firstName} ${user!.lastName}`,
      recipientDetails: "",
      amountCents: input.amountCents,
      memo: input.memo.trim() || "Mobile check deposit",
      kind: "mobile_deposit",
      status: policy,
      createdAt: timestamp,
      updatedAt: timestamp,
      reviewedBy: null,
      reviewNote: "",
      debitTransactionId: null,
      creditTransactionId: creditId,
    };
    if (creditId) {
      const posted = store.transactions.find((item) => item.id === creditId);
      if (posted) posted.transferId = request.id;
    }
    store.transfers.unshift(request);
    writeStore(store);
    return request;
  });
}

export function updateTransferStatus(input: {
  transferId: string;
  status: TransferStatus;
  reviewedBy: string;
  reviewNote: string;
}) {
  return withLock(() => {
    const store = readStore();
    const transfer = store.transfers.find((item) => item.id === input.transferId);
    if (!transfer) throw new Error("Outgoing transfer not found.");
    if (transfer.status === input.status) return transfer;

    const from = store.accounts.find((item) => item.id === transfer.fromAccountId);
    const to = transfer.toAccountId
      ? store.accounts.find((item) => item.id === transfer.toAccountId)
      : undefined;

    if (input.status === "rejected" && transfer.status !== "rejected") {
      if (transfer.kind !== "mobile_deposit" && from && transfer.debitTransactionId) {
        from.balanceCents += transfer.amountCents;
        recordTransaction(store,{
          id: createId(),
          accountId: from.id,
          type: "credit",
          amountCents: transfer.amountCents,
          balanceAfterCents: from.balanceCents,
          description: `Rejected: ${transfer.memo}`,
          counterparty: transfer.recipientName,
          createdAt: now(),
          createdBy: input.reviewedBy,
          status: "rejected",
          transferId: transfer.id,
        });
      }
      if (transfer.creditTransactionId && to && transfer.status === "completed") {
        to.balanceCents -= transfer.amountCents;
        recordTransaction(store,{
          id: createId(),
          accountId: to.id,
          type: "debit",
          amountCents: -transfer.amountCents,
          balanceAfterCents: to.balanceCents,
          description: `Reversed: ${transfer.memo}`,
          counterparty: "Southern Ridge UDC Operations",
          createdAt: now(),
          createdBy: input.reviewedBy,
          status: "rejected",
          transferId: transfer.id,
        });
      }
    }

    if (input.status === "completed" && transfer.status !== "completed") {
      if (transfer.kind === "mobile_deposit") {
        const dest = to ?? from;
        if (!dest) throw new Error("Deposit account was not found.");
        dest.balanceCents += transfer.amountCents;
        const creditId = createId();
        recordTransaction(store,{
          id: creditId,
          accountId: dest.id,
          type: "credit",
          amountCents: transfer.amountCents,
          balanceAfterCents: dest.balanceCents,
          description: transfer.memo,
          counterparty: "Mobile deposit",
          createdAt: now(),
          createdBy: input.reviewedBy,
          status: "completed",
          transferId: transfer.id,
        });
        transfer.creditTransactionId = creditId;
      } else if (to && !transfer.creditTransactionId) {
        if (to.status !== "active") {
          throw new Error("The destination account cannot receive this transfer.");
        }
        to.balanceCents += transfer.amountCents;
        const creditId = createId();
        const fromOwner = store.users.find((user) => user.id === transfer.userId);
        recordTransaction(store,{
          id: creditId,
          accountId: to.id,
          type: "transfer_in",
          amountCents: transfer.amountCents,
          balanceAfterCents: to.balanceCents,
          description: transfer.memo,
          counterparty: fromOwner
            ? `${fromOwner.firstName} ${fromOwner.lastName}`
            : transfer.recipientName,
          createdAt: now(),
          createdBy: input.reviewedBy,
          status: "completed",
          transferId: transfer.id,
        });
        transfer.creditTransactionId = creditId;
      }
    }

    transfer.status = input.status;
    transfer.updatedAt = now();
    transfer.reviewedBy = input.reviewedBy;
    transfer.reviewNote = input.reviewNote.trim();
    for (const item of store.transactions) {
      if (item.transferId === transfer.id && item.type === "transfer_out") {
        item.status = input.status;
      }
    }
    writeStore(store);
    return transfer;
  });
}

export function deleteMember(userId: string) {
  return withLock(() => {
    const store = readStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user || user.role !== "member") throw new Error("Member not found.");
    const accountIds = new Set(
      store.accounts.filter((account) => account.userId === userId).map((account) => account.id),
    );
    store.users = store.users.filter((item) => item.id !== userId);
    store.accounts = store.accounts.filter((account) => account.userId !== userId);
    store.cards = store.cards.filter((card) => card.userId !== userId);
    store.transactions = store.transactions.filter((item) => !accountIds.has(item.accountId));
    store.transfers = store.transfers.filter((item) => item.userId !== userId);
    store.loans = store.loans.filter((item) => item.userId !== userId);
    writeStore(store);
  });
}

export function deleteAccount(accountId: string) {
  return withLock(() => {
    const store = readStore();
    const account = store.accounts.find((item) => item.id === accountId);
    if (!account) throw new Error("Account not found.");
    store.accounts = store.accounts.filter((item) => item.id !== accountId);
    store.cards = store.cards.filter((card) => card.accountId !== accountId);
    store.transactions = store.transactions.filter((item) => item.accountId !== accountId);
    for (const transfer of store.transfers) {
      if (transfer.fromAccountId === accountId) transfer.fromAccountId = "";
      if (transfer.toAccountId === accountId) transfer.toAccountId = null;
    }
    writeStore(store);
    return account.userId;
  });
}

export function updateTransaction(input: {
  transactionId: string;
  description: string;
  status: TransferStatus;
}) {
  return withLock(() => {
    const store = readStore();
    const item = store.transactions.find((row) => row.id === input.transactionId);
    if (!item) throw new Error("Activity not found.");
    item.description = input.description.trim() || item.description;
    item.status = input.status;
    writeStore(store);
    return item;
  });
}

export function voidTransaction(transactionId: string, createdBy: string) {
  return withLock(() => {
    const store = readStore();
    const item = store.transactions.find((row) => row.id === transactionId);
    if (!item) throw new Error("Activity not found.");
    if (item.status === "rejected" && item.description.startsWith("Voided:")) {
      throw new Error("That posting is already voided.");
    }
    const account = store.accounts.find((row) => row.id === item.accountId);
    if (!account) throw new Error("Account not found.");
    account.balanceCents -= item.amountCents;
    item.description = `Voided: ${item.description}`;
    item.status = "rejected";
    recordTransaction(store,{
      id: createId(),
      accountId: account.id,
      type: "adjustment",
      amountCents: -item.amountCents,
      balanceAfterCents: account.balanceCents,
      description: `Void of ${item.description.replace(/^Voided:\s*/, "")}`,
      counterparty: "Southern Ridge UDC Operations",
      createdAt: now(),
      createdBy,
      status: "rejected",
      transferId: item.transferId,
    });
    writeStore(store);
    return item;
  });
}

export function applyForLoan(input: {
  userId: string;
  type: LoanType;
  purpose: string;
  amountCents: number;
  termMonths: number;
}) {
  return withLock(() => {
    const store = readStore();
    const user = store.users.find((item) => item.id === input.userId);
    assertMemberCanMoveMoney(user);
    if (input.amountCents < 50000) {
      throw new Error("Loan requests start at $500.00.");
    }
    if (input.termMonths < 6 || input.termMonths > 360) {
      throw new Error("Choose a term between 6 and 360 months.");
    }
    const loan: Loan = {
      id: createId(),
      userId: input.userId,
      type: input.type,
      purpose: input.purpose.trim() || "Member loan request",
      amountCents: input.amountCents,
      balanceCents: 0,
      aprPercent: input.type === "home" ? 6.25 : input.type === "auto" ? 7.49 : 11.99,
      termMonths: input.termMonths,
      status: "applied",
      createdAt: now(),
      updatedAt: now(),
      note: "",
    };
    store.loans.unshift(loan);
    writeStore(store);
    return loan;
  });
}

export function updateLoan(input: {
  loanId: string;
  status: LoanStatus;
  note: string;
  reviewedBy: string;
}) {
  return withLock(() => {
    const store = readStore();
    const loan = store.loans.find((item) => item.id === input.loanId);
    if (!loan) throw new Error("Loan not found.");
    const becomingActive = input.status === "active" && loan.status !== "active";
    loan.status = input.status;
    loan.note = input.note.trim();
    loan.updatedAt = now();
    if (becomingActive && loan.balanceCents === 0) {
      loan.balanceCents = loan.amountCents;
      const checking = store.accounts.find(
        (account) =>
          account.userId === loan.userId &&
          account.type === "checking" &&
          account.status === "active",
      );
      if (checking) {
        checking.balanceCents += loan.amountCents;
        recordTransaction(store,{
          id: createId(),
          accountId: checking.id,
          type: "credit",
          amountCents: loan.amountCents,
          balanceAfterCents: checking.balanceCents,
          description: `Loan proceeds — ${loan.purpose}`,
          counterparty: "Southern Ridge UDC Lending",
          createdAt: now(),
          createdBy: input.reviewedBy,
          status: "completed",
          transferId: null,
        });
      }
    }
    writeStore(store);
    return loan;
  });
}

function defaultTransferMemo(kind: TransferKind) {
  if (kind === "pay_person") return "Pay a person";
  if (kind === "wire") return "Wire transfer";
  if (kind === "mobile_deposit") return "Mobile check deposit";
  return "Member transfer";
}

function defaultAccountName(type: AccountType) {
  if (type === "checking") return "Checking";
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
      pendingMembers: members.filter((member) => member.status === "pending")
        .length,
      bannedMembers: members.filter((member) => member.status === "banned")
        .length,
      pendingTransfers: store.transfers.filter(
        (item) =>
          item.status === "pending" ||
          item.status === "hold" ||
          item.status === "processing",
      ).length,
      deposits,
      accountCount: store.accounts.length,
      pinOnFile: store.users.filter(
        (user) => user.role === "member" && Boolean(user.transferPinHash),
      ).length,
      requireTransferPin: store.settings.requireTransferPin,
      recentTransactions: store.transactions
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 8),
    };
  });
}

export function getSettings() {
  return withLock(() => readStore().settings);
}

export function updateSettings(patch: Partial<BankSettings>) {
  return withLock(() => {
    const store = readStore();
    store.settings = { ...store.settings, ...patch };
    writeStore(store);
    return store.settings;
  });
}

export function setMemberTransferPin(userId: string, pin: string) {
  return withLock(() => {
    assertTransferPin(pin);
    const store = readStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user || user.role !== "member") throw new Error("Member not found.");
    user.transferPinHash = hashPassword(pin.trim());
    writeStore(store);
    return publicUser(user);
  });
}

export function clearMemberTransferPin(userId: string) {
  return withLock(() => {
    const store = readStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user || user.role !== "member") throw new Error("Member not found.");
    user.transferPinHash = null;
    writeStore(store);
    return publicUser(user);
  });
}

export function verifyMemberTransferPin(userId: string, pin: string) {
  return withLock(() => {
    const store = readStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user) throw new Error("Member not found.");
    if (!user.transferPinHash) {
      throw new Error("A transfer PIN is required. Set one on Profile or ask operations to issue one.");
    }
    if (!/^\d{4,6}$/.test(pin.trim()) || !verifyPassword(pin.trim(), user.transferPinHash)) {
      throw new Error("That transfer PIN is incorrect.");
    }
    return true;
  });
}

export function addMemberContact(
  userId: string,
  input: {
    channel: ContactChannel;
    label: string;
    value: string;
    isPrimary: boolean;
  },
) {
  return withLock(() => {
    const store = readStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user || user.role !== "member") throw new Error("Member not found.");
    const value = input.value.trim();
    if (!value) throw new Error("Enter a contact value.");
    const contact: MemberContact = {
      id: createId(),
      channel: input.channel,
      label: input.label.trim() || input.channel,
      value,
      isPrimary: input.isPrimary || user.contacts.length === 0,
    };
    if (contact.isPrimary) {
      for (const item of user.contacts) item.isPrimary = false;
      syncPrimaryContact(user, contact);
    }
    user.contacts.push(contact);
    writeStore(store);
    return publicUser(user);
  });
}

export function updateMemberContact(
  userId: string,
  contactId: string,
  patch: {
    channel?: ContactChannel;
    label?: string;
    value?: string;
    isPrimary?: boolean;
  },
) {
  return withLock(() => {
    const store = readStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user || user.role !== "member") throw new Error("Member not found.");
    const contact = user.contacts.find((item) => item.id === contactId);
    if (!contact) throw new Error("Contact method not found.");
    if (patch.channel) contact.channel = patch.channel;
    if (patch.label !== undefined) contact.label = patch.label.trim() || contact.channel;
    if (patch.value !== undefined) {
      const value = patch.value.trim();
      if (!value) throw new Error("Enter a contact value.");
      contact.value = value;
    }
    if (patch.isPrimary) {
      for (const item of user.contacts) item.isPrimary = item.id === contactId;
    }
    const primary = user.contacts.find((item) => item.isPrimary) ?? contact;
    syncPrimaryContact(user, primary);
    writeStore(store);
    return publicUser(user);
  });
}

export function removeMemberContact(userId: string, contactId: string) {
  return withLock(() => {
    const store = readStore();
    const user = store.users.find((item) => item.id === userId);
    if (!user || user.role !== "member") throw new Error("Member not found.");
    const next = user.contacts.filter((item) => item.id !== contactId);
    if (next.length === user.contacts.length) {
      throw new Error("Contact method not found.");
    }
    if (next.length > 0 && !next.some((item) => item.isPrimary)) {
      next[0].isPrimary = true;
    }
    user.contacts = next;
    const primary = user.contacts.find((item) => item.isPrimary);
    if (primary) syncPrimaryContact(user, primary);
    writeStore(store);
    return publicUser(user);
  });
}
