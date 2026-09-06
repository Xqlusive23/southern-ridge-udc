"use client";

import { useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { InboxList } from "@/components/banking-home";
import { BankingLink } from "@/components/banking-link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { markNotificationsReadAction } from "@/lib/actions/member";
import { formatInboxDate, type MemberMessage } from "@/lib/member-inbox";
import { cn } from "@/lib/utils";

export function NotificationsBell({ messages }: { messages: MemberMessage[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const unread = messages.filter((message) => message.unread);
  const unreadCount = unread.length;

  function mark(ids: string[]) {
    startTransition(async () => {
      await markNotificationsReadAction(ids);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative grid size-11 place-items-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/20"
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notifications`
            : "Notifications"
        }
      >
        <Bell className="size-5" />
        {unreadCount > 0 ? (
          <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-[#C56A2D] px-1 text-[10px] font-bold leading-4 text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-md gap-0 border-l-[#e2ddd2] bg-white p-0 text-[#122033]"
        >
          <SheetHeader className="border-b border-[#eeeae2] px-5 py-4">
            <div className="flex items-center justify-between gap-3 pr-8">
              <SheetTitle className="text-lg">Notifications</SheetTitle>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => mark(unread.map((message) => message.id))}
                  className="text-sm font-medium text-[#2F7A45] disabled:opacity-50"
                >
                  Mark all read
                </button>
              ) : null}
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-5 py-2">
            {messages.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#5C6B64]">
                No notifications yet.
              </p>
            ) : (
              <ul className="divide-y divide-[#eeeae2]">
                {messages.map((message) => (
                  <li key={message.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <BankingLink
                        href={message.href}
                        onClick={() => {
                          if (message.unread) mark([message.id]);
                          setOpen(false);
                        }}
                        className="min-w-0 flex-1"
                      >
                        <p className="flex items-center gap-2 font-semibold">
                          {message.unread ? (
                            <span className="size-2 rounded-full bg-[#C56A2D]" />
                          ) : null}
                          {message.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-[#5C6B64]">
                          {message.preview}
                        </p>
                        <p className="mt-1 text-xs text-[#8A938C]">
                          {formatInboxDate(message.createdAt)}
                        </p>
                      </BankingLink>
                      {message.unread ? (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => mark([message.id])}
                          className={cn(
                            "shrink-0 text-xs font-medium text-[#2F7A45] disabled:opacity-50",
                          )}
                        >
                          Mark read
                        </button>
                      ) : (
                        <span className="shrink-0 text-xs text-[#8A938C]">Read</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function NotificationsPageList({ messages }: { messages: MemberMessage[] }) {
  const [pending, startTransition] = useTransition();
  const unread = messages.filter((message) => message.unread);

  return (
    <div>
      {unread.length > 0 ? (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await markNotificationsReadAction(unread.map((message) => message.id));
              })
            }
            className="text-sm font-medium text-[#2F7A45] disabled:opacity-50"
          >
            Mark all read
          </button>
        </div>
      ) : null}
      <InboxList
        messages={messages}
        empty="No desk messages yet. Transfers, deposits, and loan updates will appear here."
      />
    </div>
  );
}
