"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { FormButton } from "@/components/form-button";
import { StatusBanner } from "@/components/status-banner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  changePasswordAction,
  transferAction,
  updateProfileAction,
} from "@/lib/actions/member";
import type { Account, PublicUser } from "@/lib/types";
import { formatMoney, maskAccountNumber } from "@/lib/money";

export function TransferForm({ accounts }: { accounts: Account[] }) {
  const [state, action] = useActionState(transferAction, null);
  const usable = accounts.filter((account) => account.status === "active");

  useEffect(() => {
    if (state?.ok && state.message) toast.success(state.message);
  }, [state]);

  if (usable.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No active accounts are available for transfers.
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      <StatusBanner error={state?.error} />
      <div className="grid gap-1.5">
        <Label htmlFor="fromAccountId">From</Label>
        <select
          id="fromAccountId"
          name="fromAccountId"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          required
        >
          {usable.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} · {maskAccountNumber(account.accountNumber)} ·{" "}
              {formatMoney(account.balanceCents)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="destination">Send to</Label>
        <select
          id="destination"
          name="destination"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          defaultValue="own"
        >
          <option value="own">One of my accounts</option>
          <option value="other">Another Southern Ridge member</option>
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="toAccountId">My destination account</Label>
        <select
          id="toAccountId"
          name="toAccountId"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        >
          {usable.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} · {maskAccountNumber(account.accountNumber)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="toAccountNumber">Or member account number</Label>
        <Input
          id="toAccountNumber"
          name="toAccountNumber"
          inputMode="numeric"
          placeholder="10-digit account number"
          className="h-10"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          name="amount"
          inputMode="decimal"
          placeholder="0.00"
          className="h-10"
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="memo">Memo</Label>
        <Input id="memo" name="memo" placeholder="Optional note" className="h-10" />
      </div>
      <FormButton className="h-11 bg-[#0B2340] text-white hover:bg-[#08182C]">
        Send transfer
      </FormButton>
    </form>
  );
}

export function ProfileForm({ user }: { user: PublicUser }) {
  const [state, action] = useActionState(updateProfileAction, null);
  const [passwordState, passwordAction] = useActionState(
    changePasswordAction,
    null,
  );

  useEffect(() => {
    if (state?.ok && state.message) toast.success(state.message);
    if (passwordState?.ok && passwordState.message) {
      toast.success(passwordState.message);
    }
  }, [state, passwordState]);

  return (
    <div className="grid gap-8">
      <form action={action} className="grid gap-4">
        <StatusBanner error={state?.error} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>First name</Label>
            <Input value={user.firstName} disabled className="h-10" />
          </div>
          <div className="grid gap-1.5">
            <Label>Last name</Label>
            <Input value={user.lastName} disabled className="h-10" />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label>Email</Label>
          <Input value={user.email} disabled className="h-10" />
          <p className="text-xs text-muted-foreground">
            Legal name and email are changed by a branch officer.
          </p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={user.phone}
            className="h-10"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="address">Street address</Label>
          <Textarea
            id="address"
            name="address"
            defaultValue={user.address}
            rows={2}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={user.city} className="h-10" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              name="state"
              defaultValue={user.state}
              className="h-10"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="zip">ZIP</Label>
            <Input id="zip" name="zip" defaultValue={user.zip} className="h-10" />
          </div>
        </div>
        <FormButton className="h-10 w-fit bg-[#0B2340] text-white hover:bg-[#08182C]">
          Save contact details
        </FormButton>
      </form>

      <form action={passwordAction} className="grid max-w-md gap-4">
        <StatusBanner error={passwordState?.error} />
        <div className="grid gap-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            className="h-10"
            required
          />
        </div>
        <FormButton
          variant="outline"
          className="h-10 w-fit"
        >
          Change password
        </FormButton>
      </form>
    </div>
  );
}
