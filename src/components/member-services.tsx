"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { AccountNumberField, BankSelect, type BankOption } from "@/components/bank-fields";
import { FormButton } from "@/components/form-button";
import { StatusBanner } from "@/components/status-banner";
import { StatusPill } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  applyLoanAction,
  mobileDepositAction,
  payPersonAction,
  wireTransferAction,
} from "@/lib/actions/member";
import { amountToneClass, formatDateTime, formatMoney } from "@/lib/money";
import { LOAN_TYPES, transferKindLabel } from "@/lib/transfers";
import type { Account, Loan, TransferRequest } from "@/lib/types";

function useToastResult(state: { ok?: boolean; message?: string } | null) {
  useEffect(() => {
    if (state?.ok && state.message) toast.success(state.message);
  }, [state]);
}

function PinField({ hasPin }: { hasPin: boolean }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor="transferPin">Transfer PIN</Label>
      <Input
        id="transferPin"
        name="transferPin"
        type="password"
        inputMode="numeric"
        autoComplete="off"
        minLength={4}
        maxLength={6}
        className="h-10"
        required
      />
      <p className="text-xs text-muted-foreground">
        {hasPin
          ? "Required. Enter the 4–6 digit PIN on file."
          : "Required. Set a transfer PIN on Profile before sending money."}
      </p>
    </div>
  );
}

function AccountSelect({
  accounts,
  name = "fromAccountId",
  label = "From account",
}: {
  accounts: Account[];
  name?: string;
  label?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        required
      >
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name} · {account.accountNumber} ·{" "}
            {formatMoney(account.balanceCents)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function MobileDepositForm({ accounts }: { accounts: Account[] }) {
  const [state, action] = useActionState(mobileDepositAction, null);
  useToastResult(state);

  return (
    <form action={action} className="grid gap-4">
      <StatusBanner error={state?.error} />
      <AccountSelect accounts={accounts} name="accountId" label="Deposit to" />
      <div className="grid gap-1.5">
        <Label htmlFor="amount">Check amount</Label>
        <Input id="amount" name="amount" inputMode="decimal" placeholder="0.00" className="h-10" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="memo">Check memo</Label>
        <Input id="memo" name="memo" placeholder="Check number or payer" className="h-10" />
      </div>
      <FormButton className="h-10 w-fit bg-[#0B2340] text-white hover:bg-[#08182C]">
        Submit mobile deposit
      </FormButton>
    </form>
  );
}

export function PayPersonForm({
  accounts,
  hasPin,
}: {
  accounts: Account[];
  hasPin: boolean;
}) {
  const [state, action] = useActionState(payPersonAction, null);
  useToastResult(state);

  return (
    <form action={action} className="grid gap-4">
      <StatusBanner error={state?.error} />
      <AccountSelect accounts={accounts} />
      <div className="grid gap-1.5">
        <Label htmlFor="recipientName">Recipient name</Label>
        <Input id="recipientName" name="recipientName" className="h-10" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="recipientEmail">Recipient email</Label>
        <Input
          id="recipientEmail"
          name="recipientEmail"
          type="email"
          placeholder="recipient@email.com"
          className="h-10"
          required
        />
        <p className="text-xs text-muted-foreground">
          Required. A receipt notice is sent to this address.
        </p>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" name="amount" inputMode="decimal" placeholder="0.00" className="h-10" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="memo">Memo</Label>
        <Input id="memo" name="memo" className="h-10" />
      </div>
      <PinField hasPin={hasPin} />
      <FormButton className="h-10 w-fit bg-[#0B2340] text-white hover:bg-[#08182C]">
        Send to person
      </FormButton>
    </form>
  );
}

export function WireTransferForm({
  accounts,
  banks,
  hasPin,
}: {
  accounts: Account[];
  banks: BankOption[];
  hasPin: boolean;
}) {
  const [state, action] = useActionState(wireTransferAction, null);
  const [routingNumber, setRoutingNumber] = useState("");
  useToastResult(state);

  return (
    <form action={action} className="grid gap-4">
      <StatusBanner error={state?.error} />
      <AccountSelect accounts={accounts} />
      <div className="grid gap-1.5">
        <Label htmlFor="recipientName">Beneficiary</Label>
        <Input id="recipientName" name="recipientName" className="h-10" required />
      </div>
      <BankSelect
        banks={banks}
        label="Receiving bank"
        onBankChange={(bank) => setRoutingNumber(bank?.routing ?? "")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="routingNumber">Routing number</Label>
          <Input
            id="routingNumber"
            name="routingNumber"
            inputMode="numeric"
            pattern="[0-9]{9}"
            maxLength={9}
            className="h-10"
            required
            value={routingNumber}
            onChange={(event) =>
              setRoutingNumber(event.target.value.replace(/\D/g, "").slice(0, 9))
            }
          />
        </div>
        <AccountNumberField hint="Digits only, 4–17 numbers." />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="recipientEmail">Beneficiary email</Label>
        <Input
          id="recipientEmail"
          name="recipientEmail"
          type="email"
          className="h-10"
          required
        />
        <p className="text-xs text-muted-foreground">
          Required. A receipt notice is sent here when the wire is submitted.
        </p>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" name="amount" inputMode="decimal" placeholder="0.00" className="h-10" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="memo">Wire memo</Label>
        <Input id="memo" name="memo" className="h-10" />
      </div>
      <PinField hasPin={hasPin} />
      <FormButton className="h-10 w-fit bg-[#0B2340] text-white hover:bg-[#08182C]">
        Submit wire
      </FormButton>
    </form>
  );
}

export function LoanApplicationForm() {
  const [state, action] = useActionState(applyLoanAction, null);
  useToastResult(state);

  return (
    <form action={action} className="grid gap-4">
      <StatusBanner error={state?.error} />
      <div className="grid gap-1.5">
        <Label htmlFor="type">Loan type</Label>
        <select
          id="type"
          name="type"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          defaultValue="personal"
        >
          {LOAN_TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="amount">Amount requested</Label>
          <Input id="amount" name="amount" inputMode="decimal" placeholder="500.00" className="h-10" required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="termMonths">Term (months)</Label>
          <Input id="termMonths" name="termMonths" inputMode="numeric" defaultValue="36" className="h-10" />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="purpose">Purpose</Label>
        <Input id="purpose" name="purpose" placeholder="Vehicle, home repair, consolidation…" className="h-10" />
      </div>
      <FormButton className="h-10 w-fit bg-[#0B2340] text-white hover:bg-[#08182C]">
        Apply for loan
      </FormButton>
    </form>
  );
}

export function MemberRequestList({
  transfers,
  empty,
}: {
  transfers: TransferRequest[];
  empty: string;
}) {
  if (transfers.length === 0) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        {empty}
      </p>
    );
  }

  return (
    <ul className="grid gap-3">
      {transfers.map((item) => (
        <li
          key={item.id}
          className="flex flex-col gap-2 rounded-xl bg-[#F7F6F2] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-xs tracking-[0.14em] text-[#2F7A45] uppercase">
              {transferKindLabel(item.kind)}
            </p>
            <p className="font-medium text-[#0B2340]">{item.recipientName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(item.createdAt)}
              {item.memo ? ` · ${item.memo}` : ""}
              {" · "}
              <Link
                href={`/banking/receipts/${item.id}`}
                className="font-medium text-[#2F7A45] underline-offset-4 hover:underline"
              >
                Receipt
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={item.status} />
            <p className={`font-semibold tabular-nums ${amountToneClass(-item.amountCents)}`}>
              −{formatMoney(item.amountCents)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function MemberLoanList({ loans }: { loans: Loan[] }) {
  if (loans.length === 0) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        No loan applications yet.
      </p>
    );
  }

  return (
    <ul className="grid gap-3">
      {loans.map((loan) => (
        <li
          key={loan.id}
          className="flex flex-col gap-2 rounded-xl bg-[#F7F6F2] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-xs tracking-[0.14em] text-[#2F7A45] uppercase">
              {loan.type} · {loan.termMonths} months
            </p>
            <p className="font-medium text-[#0B2340]">{loan.purpose}</p>
            <p className="text-xs text-muted-foreground">
              APR {loan.aprPercent.toFixed(2)}%
              {loan.note ? ` · ${loan.note}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={loan.status} />
            <p className="font-semibold tabular-nums text-[#0B2340]">
              {formatMoney(loan.amountCents)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
