"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { AccountPicker } from "@/components/account-picker";
import { AccountNumberField, BankSelect, type BankOption } from "@/components/bank-fields";
import { FormButton } from "@/components/form-button";
import { StatusBanner } from "@/components/status-banner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  changePasswordAction,
  changeTransferPinAction,
  transferAction,
  updateProfileAction,
} from "@/lib/actions/member";
import type { Account, PublicUser } from "@/lib/types";

function RecipientEmailField() {
  return (
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
        Required. A receipt notice is sent to this address when the transfer posts.
      </p>
    </div>
  );
}

function TransferPinField({ hasPin }: { hasPin: boolean }) {
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
          ? "Required. Enter the 4–6 digit PIN on file for this membership."
          : "Required. Set a transfer PIN on Profile before sending money."}
      </p>
    </div>
  );
}

export function TransferForm({
  accounts,
  banks,
  hasPin,
}: {
  accounts: Account[];
  banks: BankOption[];
  hasPin: boolean;
}) {
  const [state, action] = useActionState(transferAction, null);
  const [destination, setDestination] = useState<"other" | "own">("other");
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
      <AccountPicker accounts={usable} name="fromAccountId" label="From" />
      <input type="hidden" name="destination" value={destination} />
      <div className="grid gap-2">
        <p className="text-sm font-medium">Send to</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDestination("other")}
            className={`h-10 rounded-lg border text-sm font-medium transition-colors ${
              destination === "other"
                ? "border-[#0B2340] bg-[#0B2340] text-white"
                : "border-input bg-background text-[#0B2340]"
            }`}
          >
            Another person
          </button>
          <button
            type="button"
            onClick={() => setDestination("own")}
            className={`h-10 rounded-lg border text-sm font-medium transition-colors ${
              destination === "own"
                ? "border-[#0B2340] bg-[#0B2340] text-white"
                : "border-input bg-background text-[#0B2340]"
            }`}
          >
            My accounts
          </button>
        </div>
      </div>
      {destination === "own" ? (
        <AccountPicker
          accounts={usable}
          name="toAccountId"
          label="My destination account"
        />
      ) : (
        <>
          <div className="grid gap-1.5">
            <Label htmlFor="recipientName">Recipient name</Label>
            <Input
              id="recipientName"
              name="recipientName"
              placeholder="Jordan Hale"
              className="h-10"
              required
            />
          </div>
          <BankSelect banks={banks} label="Receiving bank" />
          <AccountNumberField
            id="toAccountNumber"
            name="toAccountNumber"
            hint="Digits only, 4–17 numbers. Letters are not accepted."
          />
        </>
      )}
      <RecipientEmailField />
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
      <TransferPinField hasPin={hasPin} />
      <FormButton className="h-11 bg-[#0B2340] text-white hover:bg-[#08182C]">
        Send transfer
      </FormButton>
    </form>
  );
}

export function ProfileForm({
  user,
  allowPinChange,
}: {
  user: PublicUser;
  allowPinChange: boolean;
}) {
  const [state, action] = useActionState(updateProfileAction, null);
  const [passwordState, passwordAction] = useActionState(
    changePasswordAction,
    null,
  );
  const [pinState, pinAction] = useActionState(changeTransferPinAction, null);

  useEffect(() => {
    if (state?.ok && state.message) toast.success(state.message);
    if (passwordState?.ok && passwordState.message) {
      toast.success(passwordState.message);
    }
    if (pinState?.ok && pinState.message) toast.success(pinState.message);
  }, [state, passwordState, pinState]);

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

      {allowPinChange ? (
        <form action={pinAction} className="grid max-w-md gap-4">
          <StatusBanner error={pinState?.error} />
          <div className="grid gap-1.5">
            <Label htmlFor="pin">Transfer PIN</Label>
            <Input
              id="pin"
              name="pin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              className="h-10"
              required
            />
            <p className="text-xs text-muted-foreground">
              {user.hasTransferPin
                ? "Enter a new 4–6 digit PIN to replace the one on file."
                : "Choose a 4–6 digit PIN for outgoing transfers."}
            </p>
          </div>
          <FormButton variant="outline" className="h-10 w-fit">
            Save transfer PIN
          </FormButton>
        </form>
      ) : null}
    </div>
  );
}
