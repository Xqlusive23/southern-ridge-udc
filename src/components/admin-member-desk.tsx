"use client";

import type { ReactNode } from "react";
import {
  AccountStatusForm,
  ActivityEditForm,
  DeleteAccountForm,
  DeleteMemberForm,
  EditMemberForm,
  LoanStatusForm,
  MemberContactsForm,
  OpenAccountForm,
  ResetPasswordForm,
  TransferPinForm,
  TransferStatusForm,
} from "@/components/admin-forms";
import { MemberDeskActions } from "@/components/admin-member-row";
import { StatusPill } from "@/components/shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toListedMember } from "@/lib/admin-members";
import type { Account, DebitCard, Loan, PublicUser, Transaction, TransferRequest } from "@/lib/types";
import { formatAccountType, formatCardNumber, formatDate, formatMoney } from "@/lib/money";

export function AdminMemberDesk({
  user,
  accounts,
  cards,
  transactions,
  transfers,
  loans,
}: {
  user: PublicUser;
  accounts: Account[];
  cards: DebitCard[];
  transactions: Transaction[];
  transfers: TransferRequest[];
  loans: Loan[];
}) {
  const openTransfers = transfers.filter(
    (transfer) => transfer.status !== "completed" && transfer.status !== "rejected",
  );
  const listed = toListedMember({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    city: user.city,
    state: user.state,
    status: user.status,
    totalCents: accounts.reduce((sum, account) => sum + account.balanceCents, 0),
    outgoingStatus: user.defaultOutgoingStatus,
    openTransferCount: openTransfers.length,
    accounts,
  });

  return (
    <>
      <section className="rounded-2xl border border-[#e2ddd2] bg-white p-5 shadow-[0_1px_2px_rgba(11,35,64,0.04),0_8px_24px_rgba(11,35,64,0.04)] sm:p-6">
        <h2 className="font-semibold text-[#0B2340]">Access & transfer status</h2>
        <p className="mt-1 mb-4 text-sm text-[#5C6B64]">
          Freeze this membership, or set how new outgoing transfers start. Open
          transfers below can be moved to hold, pending, processing, or completed.
        </p>
        <MemberDeskActions member={listed} showDelete />
        {openTransfers.length > 0 ? (
          <div className="mt-5 grid gap-3 border-t border-[#f0eee8] pt-5">
            <h3 className="text-[11px] font-semibold tracking-[0.14em] text-[#8A938C] uppercase">
              Open transfers
            </h3>
            {openTransfers.map((transfer) => (
              <TransferStatusForm
                key={transfer.id}
                transfer={transfer}
                userId={user.id}
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-[#8A938C]">
            No open transfers. New ones will start as{" "}
            <span className="font-medium text-[#0B2340]">
              {user.defaultOutgoingStatus}
            </span>
            .
          </p>
        )}
      </section>

    <Tabs defaultValue={openTransfers.length > 0 ? "transfers" : "profile"} className="w-full min-w-0 gap-5">
      <div className="w-full min-w-0 overflow-x-auto">
        <TabsList className="h-auto min-w-max justify-start gap-1 rounded-2xl bg-[#e8e4da] p-1.5">
          <TabsTrigger value="profile" className="rounded-xl px-3.5 py-2">
            Profile
          </TabsTrigger>
          <TabsTrigger value="contacts" className="rounded-xl px-3.5 py-2">
            Contacts
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl px-3.5 py-2">
            Security
          </TabsTrigger>
          <TabsTrigger value="accounts" className="rounded-xl px-3.5 py-2">
            Accounts
          </TabsTrigger>
          <TabsTrigger value="cards" className="rounded-xl px-3.5 py-2">
            Cards
          </TabsTrigger>
          <TabsTrigger value="transfers" className="rounded-xl px-3.5 py-2">
            Transfers
          </TabsTrigger>
          <TabsTrigger value="loans" className="rounded-xl px-3.5 py-2">
            Loans
          </TabsTrigger>
          <TabsTrigger value="ledger" className="rounded-xl px-3.5 py-2">
            Ledger
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="profile" className="grid gap-4">
        <section className="rounded-2xl border border-[#e2ddd2] bg-white p-5 shadow-[0_1px_2px_rgba(11,35,64,0.04),0_8px_24px_rgba(11,35,64,0.04)] sm:p-6">
          <h2 className="mb-4 font-semibold text-[#0B2340]">Member information</h2>
          <EditMemberForm user={user} />
        </section>
        <DeleteMemberForm userId={user.id} lastName={user.lastName} />
      </TabsContent>

      <TabsContent value="contacts" className="rounded-2xl border border-[#e2ddd2] bg-white p-5 shadow-[0_1px_2px_rgba(11,35,64,0.04),0_8px_24px_rgba(11,35,64,0.04)] sm:p-6">
        <h2 className="mb-1 font-semibold text-[#0B2340]">Contact methods</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Add mobile, work, email, SMS, mail, or in-person options. Primary
          phone syncs to the member record.
        </p>
        <MemberContactsForm userId={user.id} contacts={user.contacts} />
      </TabsContent>

      <TabsContent value="security" className="grid gap-4">
        <section className="rounded-2xl border border-[#e2ddd2] bg-white p-5 shadow-[0_1px_2px_rgba(11,35,64,0.04),0_8px_24px_rgba(11,35,64,0.04)] sm:p-6">
          <h2 className="mb-4 font-semibold text-[#0B2340]">Transfer PIN</h2>
          <TransferPinForm userId={user.id} hasTransferPin={user.hasTransferPin} />
        </section>
        <section className="rounded-2xl border border-[#e2ddd2] bg-white p-5 shadow-[0_1px_2px_rgba(11,35,64,0.04),0_8px_24px_rgba(11,35,64,0.04)] sm:p-6">
          <h2 className="mb-4 font-semibold text-[#0B2340]">Password</h2>
          <ResetPasswordForm userId={user.id} />
        </section>
        <DeleteMemberForm userId={user.id} lastName={user.lastName} />
      </TabsContent>

      <TabsContent value="transfers" className="grid gap-3">
        {transfers.length === 0 ? (
          <p className="rounded-2xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
            No outgoing transfers, wires, or deposits yet.
          </p>
        ) : (
          transfers.map((transfer) => (
            <TransferStatusForm
              key={transfer.id}
              transfer={transfer}
              userId={user.id}
            />
          ))
        )}
      </TabsContent>

      <TabsContent value="loans" className="grid gap-3">
        {loans.length === 0 ? (
          <p className="rounded-2xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
            No loan requests on this membership.
          </p>
        ) : (
          loans.map((loan) => (
            <LoanStatusForm key={loan.id} loan={loan} userId={user.id} />
          ))
        )}
      </TabsContent>

      <TabsContent value="accounts" className="rounded-2xl border border-[#e2ddd2] bg-white p-5 shadow-[0_1px_2px_rgba(11,35,64,0.04),0_8px_24px_rgba(11,35,64,0.04)] sm:p-6">
        <h2 className="font-semibold text-[#0B2340]">Accounts</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b text-xs tracking-wide text-[#5C6B64] uppercase">
              <tr>
                <th className="pb-3 font-medium">Account</th>
                <th className="pb-3 font-medium">Number</th>
                <th className="pb-3 font-medium">Opened</th>
                <th className="pb-3 font-medium text-right">Balance</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Remove</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-b last:border-0">
                  <td className="py-3">
                    <p className="font-medium">{account.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatAccountType(account.type)}
                    </p>
                  </td>
                  <td className="py-3 tabular-nums">{account.accountNumber}</td>
                  <td className="py-3">{formatDate(account.openedAt)}</td>
                  <td className="py-3 text-right tabular-nums">
                    {formatMoney(account.balanceCents)}
                  </td>
                  <td className="py-3">
                    <AccountStatusForm account={account} userId={user.id} />
                  </td>
                  <td className="py-3">
                    <DeleteAccountForm account={account} userId={user.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 border-t pt-5">
          <h3 className="mb-3 text-sm font-medium text-[#0B2340]">
            Open another account
          </h3>
          <OpenAccountForm userId={user.id} />
        </div>
      </TabsContent>

      <TabsContent value="cards" className="rounded-2xl border border-[#e2ddd2] bg-white p-5 shadow-[0_1px_2px_rgba(11,35,64,0.04),0_8px_24px_rgba(11,35,64,0.04)] sm:p-6">
        <h2 className="font-semibold text-[#0B2340]">Debit cards</h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Issued with checking and business accounts. Freezing the membership
          freezes these cards.
        </p>
        {cards.length === 0 ? (
          <p className="text-sm text-muted-foreground">No cards on this membership.</p>
        ) : (
          <ul className="grid gap-3">
            {cards.map((card) => {
              const account = accounts.find((item) => item.id === card.accountId);
              return (
                <li
                  key={card.id}
                  className="flex flex-col gap-1 rounded-xl bg-[#F7F6F2] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-[#0B2340]">
                      {card.kind === "business" ? "Business debit" : "Debit"} ·{" "}
                      {formatCardNumber(card.pan)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {account?.name ?? "Unlinked"} · {card.holderName}
                    </p>
                  </div>
                  <StatusPill status={card.status} />
                </li>
              );
            })}
          </ul>
        )}
      </TabsContent>

      <TabsContent value="ledger" className="grid gap-3">
        <p className="text-sm text-muted-foreground">
          Only operations can edit or void member activity. Members can view
          their ledger but cannot change it.
        </p>
        {transactions.length === 0 ? (
          <p className="rounded-2xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
            No postings on this membership yet.
          </p>
        ) : (
          transactions.map((transaction) => (
            <ActivityEditForm
              key={transaction.id}
              transaction={transaction}
              userId={user.id}
            />
          ))
        )}
        </TabsContent>
    </Tabs>
    </>
  );
}

export function MemberSummary({
  status,
  outgoingStatus,
  totalCents,
  hasTransferPin,
  contactCount,
}: {
  status: string;
  outgoingStatus: string;
  totalCents: number;
  hasTransferPin: boolean;
  contactCount: number;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <SummaryChip label="Status" value={<StatusPill status={status} />} />
      <SummaryChip
        label="Future transfers"
        value={<StatusPill status={outgoingStatus} />}
      />
      <SummaryChip label="Combined" value={formatMoney(totalCents)} />
      <SummaryChip label="Transfer PIN" value={hasTransferPin ? "On file" : "Not set"} />
      <SummaryChip label="Contacts" value={String(contactCount)} />
    </div>
  );
}

function SummaryChip({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#e2ddd2] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(11,35,64,0.04)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(11,35,64,0.07)]">
      <p className="text-[11px] tracking-[0.14em] text-[#5C6B64] uppercase">
        {label}
      </p>
      <div className="mt-1 text-sm font-semibold text-[#0B2340]">{value}</div>
    </div>
  );
}
