import type { ReactNode } from "react";
import { BankLogo } from "@/components/logo";
import { PrintActions } from "@/components/print-actions";
import { StatusPill } from "@/components/shared";
import { confirmationNumber, institutionAddress } from "@/lib/documents";
import {
  formatDateTime,
  formatMoney,
  maskAccountNumber,
  memberDisplayName,
} from "@/lib/money";
import { transferKindLabel } from "@/lib/transfers";
import type { Account, BankSettings, PublicUser, TransferRequest } from "@/lib/types";

export function BankingReceipt({
  settings,
  member,
  transfer,
  fromAccount,
  toAccount,
}: {
  settings: BankSettings;
  member: PublicUser;
  transfer: TransferRequest;
  fromAccount?: Account;
  toAccount?: Account | null;
}) {
  const confirmation = confirmationNumber(transfer.id);

  return (
    <article className="banking-document mx-auto w-full max-w-[40rem] overflow-hidden rounded-sm border border-[#c8c1b2] bg-[#fffdf8] text-[#1b1b1b] shadow-[0_18px_40px_rgba(11,35,64,0.12)]">
      <header className="border-b-4 border-[#0B2340] bg-[#0B2340] px-6 py-5 text-center text-white">
        <p className="font-serif text-[1.35rem] leading-tight font-semibold tracking-wide sm:text-2xl">
          {settings.institutionName}
        </p>
        <p className="mt-1 text-[11px] tracking-[0.22em] text-[#F4E7C5] uppercase">
          Member-owned credit union
        </p>
      </header>

      <div className="flex items-start justify-between gap-4 border-b border-[#e4ddd0] px-6 py-4">
        <BankLogo />
        <div className="text-right text-[11px] leading-relaxed text-[#5C6B64]">
          <p>{settings.branchName}</p>
          <p>{institutionAddress(settings)}</p>
          <p>{settings.phone}</p>
          <p>{settings.email}</p>
        </div>
      </div>

      <div className="px-6 pt-5 pb-2 text-center">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-[#2F7A45] uppercase">
          Official transaction receipt
        </p>
        <h1 className="mt-1 font-serif text-2xl text-[#0B2340]">
          {transferKindLabel(transfer.kind)}
        </h1>
        <p className="mt-2 font-mono text-sm tracking-wide text-[#0B2340]">
          Confirmation {confirmation}
        </p>
      </div>

      <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
        <ReceiptRow label="Date / time" value={formatDateTime(transfer.createdAt)} />
        <ReceiptRow
          label="Status"
          value={<StatusPill status={transfer.status} />}
        />
        <ReceiptRow
          label="From account"
          value={
            fromAccount
              ? `${fromAccount.name} · ${maskAccountNumber(fromAccount.accountNumber)}`
              : "—"
          }
        />
        <ReceiptRow
          label="Routing"
          value={fromAccount?.routingNumber ?? "—"}
        />
        <ReceiptRow label="Paid to" value={transfer.recipientName} />
        <ReceiptRow
          label="Destination"
          value={
            transfer.recipientDetails ||
            (toAccount
              ? `${toAccount.name} · ${maskAccountNumber(toAccount.accountNumber)}`
              : transfer.toAccountNumber
                ? maskAccountNumber(transfer.toAccountNumber)
                : "—")
          }
        />
      </div>

      <div className="mx-6 rounded-sm border border-dashed border-[#0B2340]/25 bg-[#F7F6F2] px-5 py-4 text-center">
        <p className="text-[11px] tracking-[0.18em] text-[#5C6B64] uppercase">
          Amount
        </p>
        <p className="mt-1 font-serif text-3xl tabular-nums text-[#0B2340]">
          {formatMoney(transfer.amountCents)}
        </p>
        {transfer.memo ? (
          <p className="mt-2 text-sm text-[#5C6B64]">Memo: {transfer.memo}</p>
        ) : null}
      </div>

      <div className="grid gap-1 px-6 py-5 text-sm">
        <p>
          <span className="text-[#5C6B64]">Member </span>
          <span className="font-medium text-[#0B2340]">
            {memberDisplayName(member)}
          </span>
        </p>
        <p className="text-[#5C6B64]">{member.email}</p>
        {transfer.reviewNote ? (
          <p className="mt-2 text-sm text-[#5C6B64]">
            Operations note: {transfer.reviewNote}
          </p>
        ) : null}
      </div>

      <footer className="border-t border-[#e4ddd0] px-6 py-4 text-[11px] leading-relaxed text-[#5C6B64]">
        <p>
          This receipt confirms the request recorded by {settings.institutionName}.
          It is not a cashier&apos;s check, money order, or guarantee of final
          settlement until the status is completed.
        </p>
        <p className="mt-2">
          Keep this copy for your records. Questions: {settings.memberDeskPhone}{" "}
          · {settings.memberDeskEmail}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] tracking-wide text-[#8A938C]">
            {confirmation} · {transfer.id}
          </p>
          <PrintActions label="Print receipt" />
        </div>
      </footer>
    </article>
  );
}

function ReceiptRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.16em] text-[#8A938C] uppercase">
        {label}
      </p>
      <div className="mt-1 text-sm font-medium break-words text-[#0B2340]">
        {value}
      </div>
    </div>
  );
}
