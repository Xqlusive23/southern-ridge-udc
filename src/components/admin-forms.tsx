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
  adminAddContactAction,
  adminAdjustBalanceAction,
  adminClearTransferPinAction,
  adminCreateMemberAction,
  adminDeleteAccountAction,
  adminDeleteMemberAction,
  adminUpdateActivityAction,
  adminVoidActivityAction,
  adminLoanStatusAction,
  adminOpenAccountAction,
  adminRemoveContactAction,
  adminResetPasswordAction,
  adminSetTransferPinAction,
  adminTransferStatusAction,
  adminUpdateContactAction,
  adminUpdateMemberAction,
  adminSendTestEmailAction,
  adminUpdateSettingsAction,
} from "@/lib/actions/admin";
import { CONTACT_CHANNELS, STATEMENT_DELIVERY, contactChannelLabel } from "@/lib/contacts";
import { LOAN_STATUSES, TRANSFER_STATUSES, transferKindLabel } from "@/lib/transfers";
import type { Account, BankSettings, Loan, MemberContact, PublicUser, Transaction, TransferRequest } from "@/lib/types";
import { amountToneClass, formatDateTime, formatMoney } from "@/lib/money";

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
          <input
            id="firstName"
            name="firstName"
            defaultValue={user.firstName}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <input
            id="lastName"
            name="lastName"
            defaultValue={user.lastName}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={user.email}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <input
            id="phone"
            name="phone"
            defaultValue={user.phone}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="dateOfBirth">Date of birth</Label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={user.dateOfBirth}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="address">Street address</Label>
        <input
          id="address"
          name="address"
          defaultValue={user.address}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="city">City</Label>
          <input
            id="city"
            name="city"
            defaultValue={user.city}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="state">State</Label>
          <input
            id="state"
            name="state"
            defaultValue={user.state}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="zip">ZIP</Label>
          <input
            id="zip"
            name="zip"
            defaultValue={user.zip}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="status">Membership status</Label>
          <select
            id="status"
            name="status"
            defaultValue={user.status}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="active">Active</option>
            <option value="pending">Pending approval</option>
            <option value="frozen">Frozen</option>
            <option value="banned">Banned — no login</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="preferredContact">Preferred contact</Label>
          <select
            id="preferredContact"
            name="preferredContact"
            defaultValue={user.preferredContact}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {CONTACT_CHANNELS.map((channel) => (
              <option key={channel.value} value={channel.value}>
                {channel.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        className="inline-flex h-10 w-fit items-center justify-center rounded-lg bg-[#0B2340] px-4 text-sm font-medium text-white hover:bg-[#08182C]"
      >
        Save member information
      </button>
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
          <Button className="h-10 w-full bg-[#0B2340] text-white shadow-[0_8px_18px_rgba(11,35,64,0.18)] transition-[transform,background-color,box-shadow] duration-200 hover:bg-[#08182C] hover:shadow-[0_10px_22px_rgba(11,35,64,0.22)] active:scale-[0.98] sm:w-auto">
            Adjust balance
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
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
                  {account.name} · {account.accountNumber} ·{" "}
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
            <input
              id="amount"
              name="amount"
              inputMode="decimal"
              placeholder="0.00"
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="description">History description</Label>
            <input
              id="description"
              name="description"
              placeholder="Payroll credit, courtesy refund, hold release…"
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="counterparty">Counterparty</Label>
            <input
              id="counterparty"
              name="counterparty"
              placeholder="Southern Ridge UDC Operations"
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="postedAt">History date</Label>
            <input
              id="postedAt"
              name="postedAt"
              type="datetime-local"
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#0B2340] px-4 text-sm font-medium text-white hover:bg-[#08182C]"
          >
            Post adjustment
          </button>
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

export function TransferPinForm({
  userId,
  hasTransferPin,
}: {
  userId: string;
  hasTransferPin: boolean;
}) {
  const [state, action] = useActionState(adminSetTransferPinAction, null);
  const [clearState, clearAction] = useActionState(adminClearTransferPinAction, null);
  useToastResult(state);
  useToastResult(clearState);

  return (
    <div className="grid gap-4">
      <div className="rounded-xl border bg-[#F7F6F2] px-4 py-3 text-sm text-[#5C6B64]">
        {hasTransferPin
          ? "A transfer PIN is on file. Setting a new one replaces it immediately."
          : "No transfer PIN is on file. Transfers stay blocked while PIN policy is required."}
      </div>
      <form action={action} className="grid gap-3 sm:max-w-md">
        <input type="hidden" name="userId" value={userId} />
        <StatusBanner error={state?.error} />
        <div className="grid gap-1.5">
          <Label htmlFor="pin">New 4–6 digit PIN</Label>
          <Input
            id="pin"
            name="pin"
            inputMode="numeric"
            autoComplete="off"
            className="h-10"
            required
          />
        </div>
        <FormButton className="h-10 w-fit bg-[#0B2340] text-white hover:bg-[#08182C]">
          Save transfer PIN
        </FormButton>
      </form>
      {hasTransferPin ? (
        <form action={clearAction}>
          <input type="hidden" name="userId" value={userId} />
          <StatusBanner error={clearState?.error} />
          <FormButton variant="outline" className="h-10 w-fit">
            Remove PIN
          </FormButton>
        </form>
      ) : null}
    </div>
  );
}

export function MemberContactsForm({
  userId,
  contacts,
}: {
  userId: string;
  contacts: MemberContact[];
}) {
  const [addState, addAction] = useActionState(adminAddContactAction, null);
  useToastResult(addState);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3">
        {contacts.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            No contact methods yet. Add a phone, email, SMS, or mailing option.
          </p>
        ) : (
          contacts.map((contact) => (
            <ContactCard key={contact.id} userId={userId} contact={contact} />
          ))
        )}
      </div>
      <form action={addAction} className="grid gap-3 rounded-2xl border bg-[#F7F6F2] p-4">
        <input type="hidden" name="userId" value={userId} />
        <h3 className="text-sm font-semibold text-[#0B2340]">Add a contact method</h3>
        <StatusBanner error={addState?.error} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="channel">Type</Label>
            <select
              id="channel"
              name="channel"
              className="h-10 rounded-lg border border-input bg-white px-3 text-sm"
              defaultValue="mobile"
            >
              {CONTACT_CHANNELS.map((channel) => (
                <option key={channel.value} value={channel.value}>
                  {channel.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="label">Label</Label>
            <Input id="label" name="label" placeholder="Mobile, Work desk…" className="h-10 bg-white" />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="value">Value</Label>
          <Input id="value" name="value" placeholder="Number, email, or address" className="h-10 bg-white" required />
        </div>
        <label className="flex items-center gap-2 text-sm text-[#0B2340]">
          <input type="checkbox" name="isPrimary" className="size-4 accent-[#2F7A45]" />
          Make this the primary contact
        </label>
        <FormButton className="h-10 w-fit bg-[#0B2340] text-white hover:bg-[#08182C]">
          Add contact
        </FormButton>
      </form>
    </div>
  );
}

function ContactCard({
  userId,
  contact,
}: {
  userId: string;
  contact: MemberContact;
}) {
  const [state, action] = useActionState(adminUpdateContactAction, null);
  const [removeState, removeAction] = useActionState(adminRemoveContactAction, null);
  useToastResult(state);
  useToastResult(removeState);

  return (
    <article className="rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#2F7A45] uppercase">
          {contactChannelLabel(contact.channel)}
        </p>
        {contact.isPrimary ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
            Primary
          </span>
        ) : null}
      </div>
      <form action={action} className="grid gap-3">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="contactId" value={contact.id} />
        <StatusBanner error={state?.error} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Type</Label>
            <select
              name="channel"
              defaultValue={contact.channel}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            >
              {CONTACT_CHANNELS.map((channel) => (
                <option key={channel.value} value={channel.value}>
                  {channel.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label>Label</Label>
            <Input name="label" defaultValue={contact.label} className="h-10" />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label>Value</Label>
          <Input name="value" defaultValue={contact.value} className="h-10" />
        </div>
        <label className="flex items-center gap-2 text-sm text-[#0B2340]">
          <input
            type="checkbox"
            name="isPrimary"
            defaultChecked={contact.isPrimary}
            className="size-4 accent-[#2F7A45]"
          />
          Primary outreach method
        </label>
        <div className="flex flex-wrap gap-2">
          <FormButton className="h-9 bg-[#0B2340] text-white hover:bg-[#08182C]">
            Save
          </FormButton>
        </div>
      </form>
      <form action={removeAction} className="mt-2">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="contactId" value={contact.id} />
        <StatusBanner error={removeState?.error} />
        <FormButton variant="outline" className="h-9">
          Remove
        </FormButton>
      </form>
    </article>
  );
}

export function AdminPreferencesForm({
  settings,
  mailReady = false,
}: {
  settings: BankSettings;
  mailReady?: boolean;
}) {
  const [state, action] = useActionState(adminUpdateSettingsAction, null);
  const [testState, testAction] = useActionState(adminSendTestEmailAction, null);
  const [smartsuppKey, setSmartsuppKey] = useState(settings.smartsuppKey ?? "");
  const [mailFields, setMailFields] = useState({
    supportEmail: settings.supportEmail || settings.memberDeskEmail || "",
    smtpHost: settings.smtpHost ?? "",
    smtpPort: String(settings.smtpPort || 587),
    smtpUser: settings.smtpUser ?? "",
    testEmail: settings.supportEmail || settings.memberDeskEmail || "",
  });
  useToastResult(state);
  useToastResult(testState);

  useEffect(() => {
    setSmartsuppKey(settings.smartsuppKey ?? "");
    setMailFields({
      supportEmail: settings.supportEmail || settings.memberDeskEmail || "",
      smtpHost: settings.smtpHost ?? "",
      smtpPort: String(settings.smtpPort || 587),
      smtpUser: settings.smtpUser ?? "",
      testEmail: settings.supportEmail || settings.memberDeskEmail || "",
    });
  }, [
    settings.smartsuppKey,
    settings.supportEmail,
    settings.memberDeskEmail,
    settings.smtpHost,
    settings.smtpPort,
    settings.smtpUser,
  ]);

  return (
    <div className="grid gap-8">
    <form action={action} className="grid gap-6">
      <StatusBanner error={state?.error} />
      <section className="grid gap-4">
        <div>
          <h2 className="font-semibold text-[#0B2340]">Public contact</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Shown on the website contact page and footer.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="institutionName">Institution name</Label>
            <Input id="institutionName" name="institutionName" defaultValue={settings.institutionName} className="h-10" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="branchName">Branch name</Label>
            <Input id="branchName" name="branchName" defaultValue={settings.branchName} className="h-10" />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="address">Street address</Label>
          <Input id="address" name="address" defaultValue={settings.address} className="h-10" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={settings.city} className="h-10" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" defaultValue={settings.state} className="h-10" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="zip">ZIP</Label>
            <Input id="zip" name="zip" defaultValue={settings.zip} className="h-10" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="hours">Lobby hours</Label>
            <Input id="hours" name="hours" defaultValue={settings.hours} className="h-10" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="phone">Main phone</Label>
            <Input id="phone" name="phone" defaultValue={settings.phone} className="h-10" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Public email</Label>
            <Input id="email" name="email" defaultValue={settings.email} className="h-10" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="memberDeskPhone">Member desk phone</Label>
            <Input id="memberDeskPhone" name="memberDeskPhone" defaultValue={settings.memberDeskPhone} className="h-10" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="memberDeskEmail">Member desk email</Label>
            <Input id="memberDeskEmail" name="memberDeskEmail" defaultValue={settings.memberDeskEmail} className="h-10" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="afterHoursPhone">After-hours / lost card</Label>
            <Input id="afterHoursPhone" name="afterHoursPhone" defaultValue={settings.afterHoursPhone} className="h-10" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 border-t pt-6">
        <div>
          <h2 className="font-semibold text-[#0B2340]">Desk policy</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Controls transfer PIN rules and how members receive statements.
          </p>
        </div>
        <label className="flex items-start gap-3 rounded-xl border bg-[#F7F6F2] px-4 py-3 text-sm">
          <input
            type="checkbox"
            name="requireTransferPin"
            defaultChecked={settings.requireTransferPin}
            className="mt-0.5 size-4 accent-[#2F7A45]"
          />
          <span>
            <span className="font-medium text-[#0B2340]">Require a transfer PIN</span>
            <span className="mt-0.5 block text-muted-foreground">
              Members must enter their PIN before a transfer posts.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-xl border bg-[#F7F6F2] px-4 py-3 text-sm">
          <input
            type="checkbox"
            name="allowMemberPinChange"
            defaultChecked={settings.allowMemberPinChange}
            className="mt-0.5 size-4 accent-[#2F7A45]"
          />
          <span>
            <span className="font-medium text-[#0B2340]">Allow members to change their PIN</span>
            <span className="mt-0.5 block text-muted-foreground">
              If off, only operations can set or replace a PIN.
            </span>
          </span>
        </label>
        <div className="grid gap-1.5 sm:max-w-md">
          <Label htmlFor="defaultStatementDelivery">Default statement delivery</Label>
          <select
            id="defaultStatementDelivery"
            name="defaultStatementDelivery"
            defaultValue={settings.defaultStatementDelivery}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {STATEMENT_DELIVERY.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="smartsuppKey">Smartsupp chat key</Label>
          <Input
            id="smartsuppKey"
            name="smartsuppKey"
            value={smartsuppKey}
            onChange={(event) => setSmartsuppKey(event.target.value)}
            className="h-10"
            placeholder="Paste _smartsupp.key or the full chat code"
          />
          <p className="text-xs text-muted-foreground">
            From Smartsupp: Settings → Chat box → Chat code. Copy the
            _smartsupp.key value, or paste the whole snippet. A key Smartsupp
            does not recognize will not load the widget.
          </p>
        </div>
        <div className="grid gap-4 border-t pt-6">
          <div>
            <h2 className="font-semibold text-[#0B2340]">Support email</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Recipients see the bank name only, with a structured receipt and
              the receiving bank mark. The SMTP username stays hidden. For
              Gmail: host smtp.gmail.com, username is the full Gmail address,
              and the password must be a 16-character App Password.
              {mailReady ? " Mail is configured." : " Mail is not configured yet."}
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="supportEmail">SMTP from address</Label>
            <Input
              id="supportEmail"
              name="supportEmail"
              type="email"
              value={mailFields.supportEmail}
              onChange={(event) =>
                setMailFields((current) => ({ ...current, supportEmail: event.target.value }))
              }
              className="h-10"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="smtpHost">SMTP host</Label>
              <Input
                id="smtpHost"
                name="smtpHost"
                value={mailFields.smtpHost}
                onChange={(event) =>
                  setMailFields((current) => ({ ...current, smtpHost: event.target.value }))
                }
                placeholder="smtp.gmail.com"
                className="h-10"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="smtpPort">SMTP port</Label>
              <Input
                id="smtpPort"
                name="smtpPort"
                inputMode="numeric"
                value={mailFields.smtpPort}
                onChange={(event) =>
                  setMailFields((current) => ({ ...current, smtpPort: event.target.value }))
                }
                className="h-10"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="smtpUser">SMTP username</Label>
              <Input
                id="smtpUser"
                name="smtpUser"
                value={mailFields.smtpUser}
                onChange={(event) =>
                  setMailFields((current) => ({ ...current, smtpUser: event.target.value }))
                }
                className="h-10"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="smtpPassword">SMTP password</Label>
              <Input
                id="smtpPassword"
                name="smtpPassword"
                type="password"
                className="h-10"
                placeholder={
                  settings.smtpPassword
                    ? "Saved — leave blank to keep"
                    : "Gmail App Password, no spaces"
                }
              />
            </div>
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="operationsNote">Internal operations note</Label>
          <textarea
            id="operationsNote"
            name="operationsNote"
            defaultValue={settings.operationsNote}
            rows={3}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
            placeholder="Visible only to staff on this console."
          />
        </div>
      </section>

      <FormButton className="h-10 w-fit bg-[#0B2340] text-white hover:bg-[#08182C]">
        Save preferences
      </FormButton>
    </form>
    <form action={testAction} className="grid gap-3 border-t pt-6">
      <StatusBanner error={testState?.error} />
      <div className="grid gap-1.5 sm:max-w-md">
        <Label htmlFor="testEmail">Send a test support email</Label>
        <Input
          id="testEmail"
          name="testEmail"
          type="email"
          value={mailFields.testEmail}
          onChange={(event) =>
            setMailFields((current) => ({ ...current, testEmail: event.target.value }))
          }
          className="h-10"
          required
        />
      </div>
      <FormButton variant="outline" className="h-10 w-fit">
        Send test email
      </FormButton>
    </form>
    </div>
  );
}

export function TransferStatusForm({
  transfer,
  userId,
}: {
  transfer: TransferRequest;
  userId: string;
}) {
  const [state, action] = useActionState(adminTransferStatusAction, null);
  useToastResult(state);

  return (
    <article className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-[#2F7A45] uppercase">
            {transferKindLabel(transfer.kind)}
          </p>
          <p className="mt-1 font-medium text-[#0B2340]">{transfer.recipientName}</p>
          <p className="text-sm text-muted-foreground">{transfer.memo}</p>
          {transfer.recipientDetails ? (
            <p className="mt-1 text-xs text-muted-foreground">{transfer.recipientDetails}</p>
          ) : null}
        </div>
        <p className="text-lg font-semibold tabular-nums text-[#0B2340]">
          {formatMoney(transfer.amountCents)}
        </p>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {formatDateTime(transfer.createdAt)} · {transfer.status}
      </p>
      <form action={action} className="mt-3 grid gap-3">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="transferId" value={transfer.id} />
        <StatusBanner error={state?.error} />
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium text-[#0B2340]">Outgoing status</legend>
          <div className="flex flex-wrap gap-1.5">
            {TRANSFER_STATUSES.map((item) => (
              <label
                key={item.value}
                className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-200 ${
                  transfer.status === item.value
                    ? "border-[#0B2340] bg-[#0B2340] text-white shadow-sm"
                    : "border-[#d4dcd4] bg-[#fbfbf8] text-[#5C6B64] hover:border-[#0B2340]/35 hover:text-[#0B2340]"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={item.value}
                  defaultChecked={transfer.status === item.value}
                  onChange={(event) => {
                    if (event.target.checked) event.currentTarget.form?.requestSubmit();
                  }}
                  className="sr-only"
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-1.5">
          <Label>Review note</Label>
          <Input name="reviewNote" defaultValue={transfer.reviewNote} className="h-10" />
        </div>
        <FormButton className="h-9 w-fit bg-[#0B2340] text-white hover:bg-[#08182C]">
          Save note
        </FormButton>
      </form>
    </article>
  );
}

export function LoanStatusForm({ loan, userId }: { loan: Loan; userId: string }) {
  const [state, action] = useActionState(adminLoanStatusAction, null);
  useToastResult(state);

  return (
    <article className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-[#2F7A45] uppercase">
            {loan.type} · {loan.termMonths} mo
          </p>
          <p className="mt-1 font-medium text-[#0B2340]">{loan.purpose}</p>
          <p className="text-sm text-muted-foreground">
            APR {loan.aprPercent.toFixed(2)}% · balance {formatMoney(loan.balanceCents)}
          </p>
        </div>
        <p className="text-lg font-semibold tabular-nums text-[#0B2340]">
          {formatMoney(loan.amountCents)}
        </p>
      </div>
      <form action={action} className="mt-3 grid gap-3">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="loanId" value={loan.id} />
        <StatusBanner error={state?.error} />
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="grid gap-1.5">
            <Label>Loan status</Label>
            <select
              name="status"
              defaultValue={loan.status}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            >
              {LOAN_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <FormButton className="h-10 bg-[#0B2340] text-white hover:bg-[#08182C]">
            Update
          </FormButton>
        </div>
        <div className="grid gap-1.5">
          <Label>Lending note</Label>
          <Input name="note" defaultValue={loan.note} className="h-10" />
        </div>
      </form>
    </article>
  );
}

export function DeleteMemberForm({
  userId,
  lastName,
}: {
  userId: string;
  lastName: string;
}) {
  const [state, action] = useActionState(adminDeleteMemberAction, null);
  useToastResult(state);

  return (
    <form action={action} className="grid gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
      <input type="hidden" name="userId" value={userId} />
      <h3 className="font-semibold text-red-900">Delete member</h3>
      <p className="text-sm text-red-800">
        Permanently removes {lastName}&apos;s profile, accounts, transfers, and
        loans from this machine. Type DELETE to confirm.
      </p>
      <StatusBanner error={state?.error} />
      <Input name="confirm" placeholder="DELETE" className="h-10 bg-white" />
      <FormButton variant="destructive" className="h-10 w-fit">
        Delete member
      </FormButton>
    </form>
  );
}

export function DeleteAccountForm({
  account,
  userId,
}: {
  account: Account;
  userId: string;
}) {
  const [state, action] = useActionState(adminDeleteAccountAction, null);
  useToastResult(state);

  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="accountId" value={account.id} />
      <StatusBanner error={state?.error} />
      <FormButton variant="outline" className="h-8 px-2 text-xs">
        Delete account
      </FormButton>
    </form>
  );
}

export function ActivityEditForm({
  transaction,
  userId,
}: {
  transaction: Transaction;
  userId: string;
}) {
  const [state, action] = useActionState(adminUpdateActivityAction, null);
  const [voidState, voidAction] = useActionState(adminVoidActivityAction, null);
  useToastResult(state);
  useToastResult(voidState);

  return (
    <article className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {formatDateTime(transaction.createdAt)}
          {transaction.counterparty ? ` · ${transaction.counterparty}` : ""}
        </p>
        <p
          className={`font-semibold tabular-nums ${amountToneClass(transaction.amountCents)}`}
        >
          {transaction.amountCents >= 0 ? "+" : ""}
          {formatMoney(transaction.amountCents)}
        </p>
      </div>
      <form action={action} className="mt-3 grid gap-3">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="transactionId" value={transaction.id} />
        <StatusBanner error={state?.error} />
        <div className="grid gap-1.5">
          <Label>Description</Label>
          <Input name="description" defaultValue={transaction.description} className="h-10" />
        </div>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium text-[#0B2340]">Activity status</legend>
          <div className="flex flex-wrap gap-1.5">
            {TRANSFER_STATUSES.map((item) => (
              <label
                key={item.value}
                className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-200 ${
                  transaction.status === item.value
                    ? "border-[#0B2340] bg-[#0B2340] text-white shadow-sm"
                    : "border-[#d4dcd4] bg-[#fbfbf8] text-[#5C6B64] hover:border-[#0B2340]/35 hover:text-[#0B2340]"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={item.value}
                  defaultChecked={transaction.status === item.value}
                  className="sr-only"
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
        <FormButton className="h-10 w-fit bg-[#0B2340] text-white hover:bg-[#08182C]">
          Save activity
        </FormButton>
      </form>
      <form action={voidAction} className="mt-2">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="transactionId" value={transaction.id} />
        <StatusBanner error={voidState?.error} />
        <FormButton variant="outline" className="h-9">
          Void posting
        </FormButton>
      </form>
    </article>
  );
}
