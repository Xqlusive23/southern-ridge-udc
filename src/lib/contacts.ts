import type { ContactChannel, MemberContact, StatementDelivery } from "@/lib/types";

export const CONTACT_CHANNELS: {
  value: ContactChannel;
  label: string;
  placeholder: string;
}[] = [
  { value: "mobile", label: "Mobile phone", placeholder: "(912) 555-0100" },
  { value: "home", label: "Home phone", placeholder: "(912) 555-0101" },
  { value: "work", label: "Work phone", placeholder: "(912) 555-0102" },
  { value: "email", label: "Email", placeholder: "name@email.com" },
  { value: "sms", label: "SMS / text", placeholder: "(912) 555-0100" },
  { value: "mail", label: "Mailing address", placeholder: "Street, city, state ZIP" },
  { value: "branch", label: "In-person / branch", placeholder: "Main office desk" },
];

export const STATEMENT_DELIVERY: {
  value: StatementDelivery;
  label: string;
}[] = [
  { value: "email", label: "Email statements" },
  { value: "mail", label: "Paper mail" },
  { value: "both", label: "Email and paper" },
];

export function contactChannelLabel(channel: ContactChannel) {
  return CONTACT_CHANNELS.find((item) => item.value === channel)?.label ?? channel;
}

export function primaryContact(contacts: MemberContact[]) {
  return contacts.find((item) => item.isPrimary) ?? contacts[0] ?? null;
}
