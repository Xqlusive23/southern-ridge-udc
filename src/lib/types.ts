export type Role = "member" | "admin";
export type MemberStatus = "active" | "pending" | "frozen" | "closed" | "banned";
export type AccountType = "checking" | "savings" | "business";
export type AccountStatus = "active" | "frozen" | "closed";
export type CardStatus = "active" | "frozen" | "closed";
export type CardKind = "debit" | "business";
export type TransactionType =
  | "credit"
  | "debit"
  | "transfer_in"
  | "transfer_out"
  | "adjustment";
export type ContactChannel =
  | "mobile"
  | "home"
  | "work"
  | "email"
  | "sms"
  | "mail"
  | "branch";
export type StatementDelivery = "email" | "mail" | "both";
export type TransferStatus =
  | "hold"
  | "pending"
  | "processing"
  | "rejected"
  | "completed";
export type OutgoingPolicy = Extract<
  TransferStatus,
  "hold" | "pending" | "processing" | "completed"
>;
export type TransferKind =
  | "internal"
  | "member"
  | "pay_person"
  | "wire"
  | "mobile_deposit";
export type LoanType = "personal" | "auto" | "home" | "line";
export type LoanStatus =
  | "applied"
  | "review"
  | "approved"
  | "active"
  | "denied"
  | "paid";

export type MemberContact = {
  id: string;
  channel: ContactChannel;
  label: string;
  value: string;
  isPrimary: boolean;
};

export type User = {
  id: string;
  role: Role;
  email: string;
  passwordHash: string;
  transferPinHash: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dateOfBirth: string;
  status: MemberStatus;
  defaultOutgoingStatus: OutgoingPolicy;
  preferredContact: ContactChannel;
  contacts: MemberContact[];
  createdAt: string;
  lastLoginAt: string | null;
  readNotificationIds: string[];
  photoPath: string | null;
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

export type DebitCard = {
  id: string;
  userId: string;
  accountId: string;
  pan: string;
  cvv: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  kind: CardKind;
  status: CardStatus;
  createdAt: string;
};

export type Transaction = {
  id: string;
  accountId: string;
  type: TransactionType;
  description: string;
  amountCents: number;
  balanceAfterCents: number;
  counterparty: string | null;
  createdAt: string;
  createdBy: string;
  status: TransferStatus;
  transferId: string | null;
};

export type TransferRequest = {
  id: string;
  userId: string;
  fromAccountId: string;
  toAccountId: string | null;
  toAccountNumber: string | null;
  recipientName: string;
  recipientDetails: string;
  amountCents: number;
  memo: string;
  kind: TransferKind;
  status: TransferStatus;
  createdAt: string;
  updatedAt: string;
  reviewedBy: string | null;
  reviewNote: string;
  debitTransactionId: string | null;
  creditTransactionId: string | null;
};

export type Loan = {
  id: string;
  userId: string;
  type: LoanType;
  purpose: string;
  amountCents: number;
  balanceCents: number;
  aprPercent: number;
  termMonths: number;
  status: LoanStatus;
  createdAt: string;
  updatedAt: string;
  note: string;
};

export type BankSettings = {
  institutionName: string;
  branchName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  hours: string;
  phone: string;
  email: string;
  memberDeskPhone: string;
  memberDeskEmail: string;
  afterHoursPhone: string;
  requireTransferPin: boolean;
  allowMemberPinChange: boolean;
  defaultStatementDelivery: StatementDelivery;
  operationsNote: string;
  smartsuppKey: string;
  supportEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
};

export type BankStore = {
  users: User[];
  accounts: Account[];
  cards: DebitCard[];
  transactions: Transaction[];
  transfers: TransferRequest[];
  loans: Loan[];
  settings: BankSettings;
};

export type SessionUser = {
  id: string;
  role: Role;
  email: string;
  firstName: string;
  lastName: string;
  status: MemberStatus;
};

export type PublicUser = Omit<User, "passwordHash" | "transferPinHash"> & {
  hasTransferPin: boolean;
};

export type ActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
};
