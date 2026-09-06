import "server-only";

import { existsSync, readFileSync } from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { BANK_SHORT } from "@/lib/constants";
import {
  type BankBrand,
  bankBrandFromDetails,
  brandForBankName,
  homeBankBrand,
} from "@/lib/bank-brand";
import { confirmationNumber } from "@/lib/documents";
import { formatDateTime, formatMoney, maskAccountNumber } from "@/lib/money";
import { transferStatusLabel } from "@/lib/transfers";
import type { Account, BankSettings, Transaction } from "@/lib/types";

export type TransactionMailJob = {
  to: string;
  toName: string;
  settings: BankSettings;
  transaction: Transaction;
  account?: Account;
  audience: "member" | "recipient";
  receivingBankName?: string;
  senderName?: string;
};

const queue: TransactionMailJob[] = [];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function extractEmail(value: string) {
  const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0] ?? "";
}

export function redactEmails(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s·\s·/g, " · ")
    .replace(/^[\s·]+|[\s·]+$/g, "")
    .trim();
}

export function normalizeSmtpPassword(value: string) {
  return value.replace(/\s+/g, "");
}

export function mailTransportOptions(settings: BankSettings) {
  const host = (process.env.SMTP_HOST || settings.smtpHost || "").trim();
  const user = (process.env.SMTP_USER || settings.smtpUser || "").trim();
  const pass = normalizeSmtpPassword(
    process.env.SMTP_PASS || settings.smtpPassword || "",
  );
  const isGmail = /gmail\.com$/i.test(host) || /@gmail\.com$/i.test(user);
  const port = Number(process.env.SMTP_PORT || settings.smtpPort || (isGmail ? 465 : 587));
  const from =
    process.env.SMTP_FROM ||
    settings.supportEmail ||
    user ||
    settings.memberDeskEmail;
  const secure =
    process.env.SMTP_SECURE === "1" ||
    process.env.SMTP_SECURE === "true" ||
    port === 465 ||
    isGmail;
  return { host, user, pass, port, from, secure, isGmail };
}

export function friendlyMailError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/535|BadCredentials|Username and Password not accepted/i.test(message)) {
    return "SMTP rejected the login. For Resend, username is resend and the password is your API key (starts with re_). For Gmail, use the full Gmail address and a 16-character App Password with no spaces.";
  }
  if (/534|Application-specific password/i.test(message)) {
    return "Gmail requires an App Password. Turn on 2-Step Verification, then create an App Password for Mail.";
  }
  if (/not verified|domain.*not|550|553|5\.7\.1|sender.*not allowed/i.test(message)) {
    return "Resend rejected the from-address. Verify southernridgeudc.org in Resend and send from an address on that domain, such as noreply@southernridgeudc.org.";
  }
  return message;
}

export function isMailConfigured(settings: BankSettings) {
  const { host, user, pass, from } = mailTransportOptions(settings);
  return Boolean(host && user && pass && from);
}

export function enqueueTransactionMail(job: TransactionMailJob) {
  if (!extractEmail(job.to)) return;
  queue.push(job);
}

export function flushTransactionMail() {
  if (queue.length === 0) return;
  const jobs = queue.splice(0, queue.length);
  void Promise.all(jobs.map((job) => sendTransactionNotice(job).catch((error) => {
    console.error("Support email failed:", error instanceof Error ? error.message : error);
  })));
}

function createTransporter(options: ReturnType<typeof mailTransportOptions>) {
  return nodemailer.createTransport(
    options.isGmail
      ? {
          service: "gmail",
          auth: { user: options.user, pass: options.pass },
        }
      : {
          host: options.host,
          port: options.port,
          secure: options.secure,
          auth: { user: options.user, pass: options.pass },
        },
  );
}

function sameAddress(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function homeLogoAttachment() {
  const file = path.join(process.cwd(), "public", "email-mark.png");
  if (!existsSync(file)) return [];
  return [
    {
      filename: "southern-ridge.png",
      content: readFileSync(file),
      cid: "sr-bank-logo",
      contentType: "image/png",
    },
  ];
}

async function deliverHtmlEmail(
  settings: BankSettings,
  input: {
    to: string;
    subject: string;
    text: string;
    html: string;
    fromName: string;
    attachHomeLogo?: boolean;
  },
) {
  const options = mailTransportOptions(settings);
  if (!isMailConfigured(settings)) {
    throw new Error(
      "Set SMTP host, username, password, and the support from-address in Preferences or .env.",
    );
  }
  const transporter = createTransporter(options);
  const headerAddress = extractEmail(options.from) || extractEmail(options.user);
  if (!headerAddress) {
    throw new Error(
      "Set SMTP from address to a mailbox on your verified domain, such as noreply@southernridgeudc.org.",
    );
  }
  const fallbackAddress = extractEmail(options.user);
  const attempts = [{ name: input.fromName, address: headerAddress }];
  if (fallbackAddress && !sameAddress(headerAddress, fallbackAddress)) {
    attempts.push({ name: input.fromName, address: fallbackAddress });
  }

  let lastError: unknown;
  for (const from of attempts) {
    try {
      await transporter.sendMail({
        from,
        envelope: { from: headerAddress, to: input.to },
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
        attachments: input.attachHomeLogo ? homeLogoAttachment() : undefined,
      });
      return;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (!/from|sender|553|550|5\.7\.1|not allowed/i.test(message)) {
        throw new Error(friendlyMailError(error));
      }
    }
  }
  throw new Error(friendlyMailError(lastError));
}

export async function sendSupportEmail(
  settings: BankSettings,
  input: {
    to: string;
    subject: string;
    text: string;
    html: string;
    fromName?: string;
    attachHomeLogo?: boolean;
  },
) {
  await deliverHtmlEmail(settings, {
    ...input,
    fromName: input.fromName || BANK_SHORT,
    attachHomeLogo:
      input.attachHomeLogo ?? (input.fromName === BANK_SHORT || !input.fromName),
  });
}

function statusTone(status: Transaction["status"]) {
  if (status === "completed") return { bg: "#E8F5EC", fg: "#1B6B34" };
  if (status === "rejected") return { bg: "#F8E4E4", fg: "#8A1F1F" };
  return { bg: "#F4EBD3", fg: "#8A6A16" };
}

function bankMarkHtml(brand: BankBrand) {
  if (brand.shortName === BANK_SHORT) {
    return `
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:middle;padding-right:12px">
            <img src="cid:sr-bank-logo" width="48" height="38" alt="" style="display:block;border:0;outline:none" />
          </td>
          <td style="font-family:Georgia,Times,'Times New Roman',serif;font-size:15px;line-height:1.25;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#F4E7C5">
            ${escapeHtml(brand.shortName)}
          </td>
        </tr>
      </table>
    `;
  }
  const logo = brand.logoDomain
    ? `<img src="https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(brand.logoDomain)}" width="42" height="42" alt="${escapeHtml(brand.shortName)}" style="display:block;border:0;border-radius:21px;background:#ffffff" />`
    : `<div style="width:42px;height:42px;border-radius:21px;background:${brand.accent};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;line-height:42px;text-align:center">${escapeHtml(brand.initials)}</div>`;
  return `
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:42px;height:42px;vertical-align:middle">
          ${logo}
        </td>
        <td style="padding-left:12px;font-family:Georgia,Times,'Times New Roman',serif;font-size:18px;line-height:1.2;font-weight:700;color:#ffffff">
          ${escapeHtml(brand.shortName)}
        </td>
      </tr>
    </table>
  `;
}

function receiptRow(label: string, value: string) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #E8E2D6;width:38%;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8A938C;vertical-align:top">
        ${escapeHtml(label)}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #E8E2D6;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#0B2340;vertical-align:top">
        ${escapeHtml(value)}
      </td>
    </tr>
  `;
}

function buildReceiptHtml(input: {
  brand: BankBrand;
  eyebrow: string;
  title: string;
  greeting: string;
  amount: string;
  amountColor: string;
  confirmation: string;
  status: Transaction["status"];
  rows: Array<[string, string]>;
  note: string;
}) {
  const tone = statusTone(input.status);
  const statusLabel = transferStatusLabel(input.status);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background:#E8E4DA">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E8E4DA;padding:24px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFDF8;border:1px solid #C8C1B2">
          <tr>
            <td style="background:${input.brand.color};padding:22px 28px">
              ${bankMarkHtml(input.brand)}
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;text-align:center">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#2F7A45">
                ${escapeHtml(input.eyebrow)}
              </p>
              <h1 style="margin:8px 0 0;font-family:Georgia,Times,'Times New Roman',serif;font-size:26px;line-height:1.2;color:#0B2340">
                ${escapeHtml(input.title)}
              </h1>
              <p style="margin:10px 0 0;font-family:Consolas,'Courier New',monospace;font-size:13px;letter-spacing:.08em;color:#0B2340">
                Confirmation ${escapeHtml(input.confirmation)}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#122033">
              ${escapeHtml(input.greeting)}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F2;border:1px dashed rgba(11,35,64,.25)">
                <tr>
                  <td style="padding:18px 16px;text-align:center">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#5C6B64">Amount</p>
                    <p style="margin:8px 0 0;font-family:Georgia,Times,'Times New Roman',serif;font-size:32px;line-height:1;color:${input.amountColor}">${escapeHtml(input.amount)}</p>
                    <p style="margin:12px 0 0">
                      <span style="display:inline-block;padding:4px 10px;background:${tone.bg};color:${tone.fg};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">
                        ${escapeHtml(statusLabel)}
                      </span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 8px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${input.rows.map(([label, value]) => receiptRow(label, value)).join("")}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#5C6B64">
              ${escapeHtml(input.note)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildReceiptText(input: {
  brand: BankBrand;
  title: string;
  greeting: string;
  amount: string;
  confirmation: string;
  status: Transaction["status"];
  rows: Array<[string, string]>;
  note: string;
}) {
  const lines = [
    input.brand.shortName,
    input.title,
    `Confirmation ${input.confirmation}`,
    "",
    input.greeting,
    "",
    `Amount: ${input.amount}`,
    `Status: ${transferStatusLabel(input.status)}`,
    ...input.rows.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`),
    "",
    input.note,
  ];
  return lines.join("\n");
}

export function buildTransactionReceipt(job: TransactionMailJob) {
  const inbound =
    job.audience === "recipient" ||
    job.transaction.amountCents >= 0 ||
    job.transaction.type === "transfer_in" ||
    job.transaction.type === "credit";
  const amount = formatMoney(Math.abs(job.transaction.amountCents));
  const signed = inbound ? amount : `−${amount}`;
  const confirmation = confirmationNumber(job.transaction.transferId || job.transaction.id);
  const receiving = job.receivingBankName
    ? brandForBankName(job.receivingBankName)
    : bankBrandFromDetails(job.transaction.description);
  const brand = job.audience === "recipient" ? receiving : homeBankBrand();
  const description = redactEmails(job.transaction.description);
  const counterparty = redactEmails(job.transaction.counterparty || "");
  const senderName = redactEmails(job.senderName || "");
  const accountLabel = job.account
    ? `${job.account.name} ${maskAccountNumber(job.account.accountNumber)}`
    : "";

  const rows: Array<[string, string]> = [];
  if (job.audience === "member" && accountLabel) {
    rows.push([inbound ? "Posted to" : "From account", accountLabel]);
  }
  if (job.audience === "recipient") {
    rows.push(["Received from", senderName || "A Southern Ridge member"]);
    rows.push(["Receiving bank", receiving.shortName]);
  } else if (counterparty) {
    rows.push([inbound ? "From" : "Paid to", counterparty]);
    if (receiving.shortName !== BANK_SHORT) {
      rows.push(["Receiving bank", receiving.shortName]);
    }
  }
  if (description) rows.push(["Memo", description]);
  rows.push(["Date / time", formatDateTime(job.transaction.createdAt)]);

  const title = inbound ? "Incoming transfer" : "Outgoing transfer";
  const greeting =
    job.audience === "recipient"
      ? `Hello ${job.toName}, you received an incoming transfer to your ${receiving.shortName} account.`
      : inbound
        ? `Hello ${job.toName}, an incoming transfer posted to your account.`
        : `Hello ${job.toName}, an outgoing transfer posted to your account.`;
  const note =
    "This receipt confirms the request as recorded. It is not a cashier's check, money order, or guarantee of final settlement until the status is completed. This notice was sent automatically.";

  return {
    brand,
    subject: `${brand.shortName}: ${amount} ${inbound ? "received" : "sent"}`,
    text: buildReceiptText({
      brand,
      title,
      greeting,
      amount: signed,
      confirmation,
      status: job.transaction.status,
      rows,
      note,
    }),
    html: buildReceiptHtml({
      brand,
      eyebrow: "Official transaction receipt",
      title,
      greeting,
      amount: signed,
      amountColor: inbound ? "#1B6B34" : "#B42318",
      confirmation,
      status: job.transaction.status,
      rows,
      note,
    }),
  };
}

export async function sendTransactionNotice(job: TransactionMailJob) {
  const receipt = buildTransactionReceipt(job);
  await sendSupportEmail(job.settings, {
    to: job.to,
    subject: receipt.subject,
    text: receipt.text,
    html: receipt.html,
    fromName: receipt.brand.shortName,
    attachHomeLogo: receipt.brand.shortName === BANK_SHORT,
  });
}

export function buildMailPreview(settings: BankSettings, toName: string) {
  const brand = homeBankBrand();
  const note =
    "This is a delivery test. Transaction receipts use this same layout, sent under the bank name only.";
  return {
    subject: `${brand.shortName}: mail delivery test`,
    text: buildReceiptText({
      brand,
      title: "Mail delivery test",
      greeting: `Hello ${toName}, this confirms notices will arrive as a structured receipt.`,
      amount: formatMoney(12500),
      confirmation: "SR-TESTMAIL",
      status: "completed",
      rows: [
        ["Posted to", "Checking •••• 1840"],
        ["Paid to", "Sample recipient"],
        ["Date / time", formatDateTime(new Date().toISOString())],
      ],
      note,
    }),
    html: buildReceiptHtml({
      brand,
      eyebrow: "Official transaction receipt",
      title: "Mail delivery test",
      greeting: `Hello ${toName}, this confirms notices will arrive as a structured receipt.`,
      amount: formatMoney(12500),
      amountColor: "#1B6B34",
      confirmation: "SR-TESTMAIL",
      status: "completed",
      rows: [
        ["Posted to", "Checking •••• 1840"],
        ["Paid to", "Sample recipient"],
        ["Date / time", formatDateTime(new Date().toISOString())],
      ],
      note,
    }),
    fromName: brand.shortName,
  };
}
