"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  adminAddMemberAmountAction,
  adminQuickMemberAction,
} from "@/lib/actions/admin";
import type { ListedMember } from "@/lib/admin-members";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

const CHOICES = [
  { value: "freeze", label: "Freeze" },
  { value: "hold", label: "Hold" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
] as const;

function selectedChoice(member: ListedMember) {
  if (member.status === "frozen") return "freeze";
  if (
    member.outgoingStatus === "hold" ||
    member.outgoingStatus === "pending" ||
    member.outgoingStatus === "processing" ||
    member.outgoingStatus === "completed"
  ) {
    return member.outgoingStatus;
  }
  return "";
}

function useToastResult(state: { ok?: boolean; message?: string; error?: string } | null) {
  useEffect(() => {
    if (state?.ok && state.message) toast.success(state.message);
    if (state && !state.ok && state.error) toast.error(state.error);
  }, [state]);
}

export function MemberAmountForm({ member }: { member: ListedMember }) {
  const [state, action] = useActionState(adminAddMemberAmountAction, null);
  useToastResult(state);

  if (member.accounts.length === 0) {
    return <p className="text-xs text-muted-foreground">No accounts to post to.</p>;
  }

  return (
    <form action={action} className="grid w-full min-w-0 gap-2">
      <input type="hidden" name="userId" value={member.id} />
      <select
        name="accountId"
        aria-label="Account"
        className="admin-field"
        required
        defaultValue={member.accounts[0]?.id}
      >
        {member.accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name} · {account.accountNumber} · {formatMoney(account.balanceCents)}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          name="amount"
          inputMode="decimal"
          placeholder="Amount"
          aria-label="Amount"
          className="admin-field"
          required
        />
        <select
          name="mode"
          aria-label="Credit or debit"
          className="admin-field"
          defaultValue="credit"
        >
          <option value="credit">Add</option>
          <option value="debit">Remove</option>
        </select>
      </div>
      <input
        name="description"
        placeholder="History description"
        aria-label="History description"
        className="admin-field"
        required
      />
      <input
        name="counterparty"
        placeholder="Counterparty (optional)"
        aria-label="Counterparty"
        className="admin-field"
      />
      <input
        name="postedAt"
        type="datetime-local"
        aria-label="History date"
        className="admin-field"
      />
      <button
        type="submit"
        className="h-8 w-fit rounded-md bg-[#0B2340] px-2.5 text-xs font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[#08182C] active:scale-[0.98]"
      >
        Post amount
      </button>
    </form>
  );
}

export function MemberDeskActions({
  member,
  showDelete = true,
}: {
  member: ListedMember;
  showDelete?: boolean;
}) {
  const [state, action] = useActionState(adminQuickMemberAction, null);
  useToastResult(state);
  const selected = selectedChoice(member);

  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="userId" value={member.id} />
      {member.status === "pending" ? (
        <button
          type="submit"
          name="choice"
          value="approve"
          className="h-8 w-fit rounded-md bg-[#2F7A45] px-2.5 text-xs font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[#246338] active:scale-[0.98]"
        >
          Approve membership
        </button>
      ) : null}
      <fieldset className="flex flex-wrap gap-1.5">
        <legend className="mb-1.5 w-full text-[11px] font-semibold tracking-[0.14em] text-[#8A938C] uppercase">
          Membership & future transfers
        </legend>
        {CHOICES.map((choice) => (
          <label
            key={choice.value}
            className={cn(
              "cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-200",
              selected === choice.value
                ? "border-[#0B2340] bg-[#0B2340] text-white shadow-sm"
                : "border-[#d4dcd4] bg-[#fbfbf8] text-[#5C6B64] hover:border-[#0B2340]/35 hover:text-[#0B2340]",
            )}
          >
            <input
              type="radio"
              name="choice"
              value={choice.value}
              defaultChecked={selected === choice.value}
              onChange={(event) => {
                if (event.target.checked) event.currentTarget.form?.requestSubmit();
              }}
              className="sr-only"
            />
            {choice.label}
          </label>
        ))}
      </fieldset>
      <p className="text-[11px] leading-relaxed text-[#8A938C]">
        Freeze locks the membership. Hold, pending, processing, and completed
        set how new outgoing transfers start.
      </p>
      {showDelete ? (
        <button
          type="submit"
          name="choice"
          value="delete"
          className="h-8 w-fit rounded-md border border-red-200/80 px-2.5 text-xs font-medium text-red-700 transition-all duration-200 hover:bg-red-50 active:scale-[0.98]"
        >
          Delete user
        </button>
      ) : null}
    </form>
  );
}

export function DeleteUserButton({ userId }: { userId: string }) {
  const [state, action] = useActionState(adminQuickMemberAction, null);
  useToastResult(state);

  return (
    <form
      action={action}
      onClick={(event) => event.stopPropagation()}
    >
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        name="choice"
        value="delete"
        className="h-8 rounded-md border border-red-200/80 px-2.5 text-xs font-medium text-red-700 transition-all duration-200 hover:bg-red-50 active:scale-[0.98]"
      >
        Delete
      </button>
    </form>
  );
}
