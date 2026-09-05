"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { FormButton } from "@/components/form-button";
import { StatusBanner } from "@/components/status-banner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminAccountStatusAction,
  adminAdjustBalanceAction,
  adminCreateMemberAction,
  adminOpenAccountAction,
  adminResetPasswordAction,
  adminUpdateMemberAction,
} from "@/lib/actions/admin";
import type { Account, PublicUser } from "@/lib/types";
import { formatMoney, maskAccountNumber } from "@/lib/money";

function useToastResult(state: { ok?: boolean; message?: string } | null) {
  useEffect(() => {
    if (state?.ok && state.message) toast.success(state.message);
  }, [state]);
}

export function CreateMemberForm() {
  const [state, action] = useActionState(adminCreateMemberAction, null);
  useToastResult(state);

  return (
    <form action={action} className="grid gap-3">
      <StatusBanner error={state?.error} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" className="h-10" required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" className="h-10" required />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" className="h-10" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Temporary password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          className="h-10"
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" className="h-10" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" className="h-10" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" className="h-10" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" className="h-10" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="zip">ZIP</Label>
          <Input id="zip" name="zip" className="h-10" />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="dateOfBirth">Date of birth</Label>
        <Input id="dateOfBirth" name="dateOfBirth" type="date" className="h-10" />
      </div>
      <FormButton className="h-10 bg-[#0B2340] text-white hover:bg-[#08182C]">
        Create member
      </FormButton>
    </form>
  );
}

export function EditMemberForm({ user }: { user: PublicUser }) {
  const [state, action] = useActionState(adminUpdateMemberAction, null);
  useToastResult(state);

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="userId" value={user.id} />
      <StatusBanner error={state?.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={user.firstName}
            className="h-10"
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={user.lastName}
            className="h-10"
            required
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={user.email}
          className="h-10"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={user.phone} className="h-10" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="dateOfBirth">Date of birth</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={user.dateOfBirth}
            className="h-10"
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="address">Street address</Label>
        <Input
          id="address"
          name="address"
          defaultValue={user.address}
          className="h-10"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={user.city} className="h-10" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" defaultValue={user.state} className="h-10" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="zip">ZIP</Label>
          <Input id="zip" name="zip" defaultValue={user.zip} className="h-10" />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="status">Membership status</Label>
        <select
          id="status"
          name="status"
          defaultValue={user.status}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="active">Active</option>
          <option value="frozen">Frozen</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      <FormButton className="h-10 w-fit bg-[#0B2340] text-white hover:bg-[#08182C]">
        Save member information
      </FormButton>
    </form>
  );
}

export function AdjustBalanceForm({
  accounts,
  userId,
}: {
  accounts: Account[];
  userId: string;
}) {
  const [state, action] = useActionState(adminAdjustBalanceAction, null);
  const [open, setOpen] = useState(false);
  useToastResult(state);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="h-10 bg-[#0B2340] text-white hover:bg-[#08182C]">
            Adjust balance
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change account balance</DialogTitle>
        </DialogHeader>
        <form action={action} className="grid gap-3">
          <input type="hidden" name="userId" value={userId} />
          <StatusBanner error={state?.error} />
          <div className="grid gap-1.5">
            <Label htmlFor="accountId">Account</Label>
            <select
              id="accountId"
              name="accountId"
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              required
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} · {maskAccountNumber(account.accountNumber)} ·{" "}
                  {formatMoney(account.balanceCents)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="mode">Action</Label>
            <select
              id="mode"
              name="mode"
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              defaultValue="set"
            >
              <option value="set">Set exact balance</option>
              <option value="credit">Credit (add funds)</option>
              <option value="debit">Debit (remove funds)</option>
            </select>
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
            <Label htmlFor="description">Memo</Label>
            <Input
              id="description"
              name="description"
              placeholder="Correction, courtesy credit, hold release…"
              className="h-10"
            />
          </div>
          <FormButton className="h-10 bg-[#0B2340] text-white hover:bg-[#08182C]">
            Post adjustment
          </FormButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function OpenAccountForm({ userId }: { userId: string }) {
  const [state, action] = useActionState(adminOpenAccountAction, null);
  useToastResult(state);

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="userId" value={userId} />
      <StatusBanner error={state?.error} />
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <div className="grid gap-1.5">
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          name="type"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          defaultValue="checking"
        >
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="business">Business</option>
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="name">Account name</Label>
        <Input id="name" name="name" placeholder="Optional nickname" className="h-10" />
      </div>
      <FormButton className="h-10">Open account</FormButton>
      </div>
    </form>
  );
}

export function AccountStatusForm({
  account,
  userId,
}: {
  account: Account;
  userId: string;
}) {
  const [state, action] = useActionState(adminAccountStatusAction, null);
  useToastResult(state);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="accountId" value={account.id} />
      <input type="hidden" name="userId" value={userId} />
      <select
        name="status"
        defaultValue={account.status}
        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
      >
        <option value="active">Active</option>
        <option value="frozen">Frozen</option>
        <option value="closed">Closed</option>
      </select>
      <FormButton variant="outline" className="h-8 px-2 text-xs">
        Update
      </FormButton>
      {state?.error ? (
        <span className="text-xs text-red-600">{state.error}</span>
      ) : null}
    </form>
  );
}

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, action] = useActionState(adminResetPasswordAction, null);
  useToastResult(state);

  return (
    <form action={action} className="grid gap-3 sm:max-w-md">
      <input type="hidden" name="userId" value={userId} />
      <StatusBanner error={state?.error} />
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
      <FormButton variant="outline" className="h-10 w-fit">
        Reset password
      </FormButton>
    </form>
  );
}
