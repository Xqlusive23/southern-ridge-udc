import type { TransferStatus } from "@/lib/types";

export type ListedAccount = {
  id: string;
  name: string;
  accountNumber: string;
  balanceCents: number;
};

export type ListedMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  state: string;
  status: string;
  totalCents: number;
  outgoingStatus: TransferStatus | null;
  openTransferCount: number;
  accounts: ListedAccount[];
};

export function toListedMember(member: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  state: string;
  status: string;
  totalCents: number;
  outgoingStatus: TransferStatus | null;
  openTransferCount: number;
  accounts: { id: string; name: string; accountNumber: string; balanceCents: number }[];
}): ListedMember {
  return {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    city: member.city,
    state: member.state,
    status: member.status,
    totalCents: member.totalCents,
    outgoingStatus: member.outgoingStatus,
    openTransferCount: member.openTransferCount,
    accounts: member.accounts.map((account) => ({
      id: account.id,
      name: account.name,
      accountNumber: account.accountNumber,
      balanceCents: account.balanceCents,
    })),
  };
}
