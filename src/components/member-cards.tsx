"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { DebitCardFace } from "@/components/banking-ui";
import { setCardStatusAction } from "@/lib/actions/member";
import { formatCardNumber } from "@/lib/money";
import type { Account, DebitCard } from "@/lib/types";

function useToastResult(state: { ok?: boolean; message?: string; error?: string } | null) {
  useEffect(() => {
    if (state?.ok && state.message) toast.success(state.message);
    if (state && !state.ok && state.error) toast.error(state.error);
  }, [state]);
}

export function MemberCardPanel({
  card,
  account,
}: {
  card: DebitCard;
  account?: Account;
}) {
  const [revealed, setRevealed] = useState(false);
  const [state, action] = useActionState(setCardStatusAction, null);
  useToastResult(state);
  const nextStatus = card.status === "frozen" ? "active" : "frozen";

  return (
    <div className="grid gap-4">
      <DebitCardFace card={card} account={account} revealed={revealed} />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setRevealed((value) => !value)}
          className="h-9 rounded-lg border border-[#e2ddd2] bg-white px-3 text-xs font-medium text-[#0B2340] transition-all duration-200 hover:border-[#0B2340]/30 active:scale-[0.98]"
        >
          {revealed ? "Hide number" : "Show card number"}
        </button>
        {card.status !== "closed" ? (
          <form action={action}>
            <input type="hidden" name="cardId" value={card.id} />
            <input type="hidden" name="status" value={nextStatus} />
            <button
              type="submit"
              className="h-9 rounded-lg bg-[#0B2340] px-3 text-xs font-medium text-white transition-[transform,background-color] duration-200 hover:bg-[#08182C] active:scale-[0.98]"
            >
              {card.status === "frozen" ? "Turn card on" : "Freeze card"}
            </button>
          </form>
        ) : null}
      </div>
      {revealed ? (
        <dl className="grid gap-2 rounded-xl bg-[#F7F6F2] px-4 py-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[#5C6B64]">Card number</dt>
            <dd className="tabular-nums font-medium text-[#0B2340]">
              {formatCardNumber(card.pan, true)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#5C6B64]">CVV</dt>
            <dd className="tabular-nums font-medium text-[#0B2340]">{card.cvv}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
