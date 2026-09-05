export type Role = "member" | "admin";
export type MemberStatus = "active" | "frozen" | "closed";
export type AccountType = "checking" | "savings" | "business";
export type AccountStatus = "active" | "frozen" | "closed";
export type TransactionType =
  | "credit"
  | "debit"
  | "transfer_in"
  | "transfer_out"
  | "adjustment";

export type User = {
  id: string;
  role: Role;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dateOfBirth: string;
  status: MemberStatus;
  createdAt: string;
  lastLoginAt: string | null;
};

export type Account = {
  id: string;
  userId: string;
  type: AccountType;
  name: string;
  accountNumber: string;
  routingNumber: string;
  balanceCents: number;
  status: AccountStatus;
  openedAt: string;
};

export type Transaction = {
  id: string;
  accountId: string;
  type: TransactionType;
  amountCents: number;
  balanceAfterCents: number;
  description: string;
  counterparty: string | null;
  createdAt: string;
  createdBy: string;
};

export type BankStore = {
  users: User[];
  accounts: Account[];
  transactions: Transaction[];
};

export type SessionUser = {
  id: string;
  role: Role;
  email: string;
  firstName: string;
  lastName: string;
  status: MemberStatus;
};

export type PublicUser = Omit<User, "passwordHash">;

export type ActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
};
