import Link from "next/link";
import { redirect } from "next/navigation";
import { BankingScreen } from "@/components/banking-screen";
import { ProfileForm } from "@/components/member-forms";
import { DisplayPreferencesForm } from "@/components/member-display";
import { ProfilePhotoForm } from "@/components/profile-photo-form";
import { t } from "@/lib/i18n";
import { contactChannelLabel } from "@/lib/contacts";
import { listStatementPeriods } from "@/lib/documents";
import { requireSession } from "@/lib/auth";
import { formatAccountType, formatMoney, memberDisplayName, photoSrc } from "@/lib/money";
import { getMemberBanking, getSettings } from "@/lib/store";

export default async function ProfilePage() {
  const session = await requireSession("member");
  if (!session) redirect("/login");
  const [banking, settings] = await Promise.all([
    getMemberBanking(session.id),
    getSettings(),
  ]);
  if (!banking) redirect("/login");
  const initials = `${banking.user.firstName[0] ?? ""}${banking.user.lastName[0] ?? ""}`;
  const openedAt = banking.accounts
    .map((account) => account.openedAt)
    .sort()[0] ?? banking.user.createdAt;
  const statements = listStatementPeriods(openedAt);
  const locale = banking.user.locale;
  const moneyPrefs = { currency: banking.user.currency, locale };

  return (
    <BankingScreen
      title={t(locale, "profileTitle")}
      description={t(locale, "profileDesc")}
    >
      <section>
        <h2 className="font-semibold text-[#0B2340]">{t(locale, "languageCurrency")}</h2>
        <p className="mt-1 mb-4 text-sm text-[#5C6B64]">
          {t(locale, "languageCurrencyHelp")}
        </p>
        <DisplayPreferencesForm locale={locale} currency={banking.user.currency} />
      </section>
      <section className="mt-8">
        <h2 className="font-semibold text-[#0B2340]">{t(locale, "profilePhoto")}</h2>
        <p className="mt-1 mb-4 text-sm text-[#5C6B64]">
          {t(locale, "profilePhotoHelp")}
        </p>
        <ProfilePhotoForm
          photoPath={photoSrc(session.id, banking.user.photoPath)}
          initials={initials}
          name={memberDisplayName(banking.user)}
        />
      </section>
      <section className="mt-8">
        <h2 className="font-semibold text-[#0B2340]">{t(locale, "statements")}</h2>
        <p className="mt-1 text-sm text-[#5C6B64]">
          {t(locale, "statementsHelp")}
        </p>
        <ul className="mt-4 grid gap-2">
          {statements.map((item) => (
            <li key={item.id}>
              <Link
                href={`/banking/statements/${item.id}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-[#F7F6F2] px-4 py-3 text-sm transition-colors hover:bg-[#efece4]"
              >
                <span className="font-medium text-[#0B2340]">{item.label}</span>
                <span className="text-xs tracking-[0.12em] text-[#2F7A45] uppercase">
                  {item.kind === "final" ? t(locale, "generateStatement") : t(locale, "interim")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="font-semibold text-[#0B2340]">{t(locale, "accountNumbers")}</h2>
        <p className="mt-1 text-sm text-[#5C6B64]">
          {t(locale, "accountNumbersHelp")}
        </p>
        <ul className="mt-4 grid gap-3">
          {banking.accounts.map((account) => (
            <li
              key={account.id}
              className="flex flex-col gap-1 rounded-xl bg-[#F7F6F2] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs tracking-[0.14em] text-[#2F7A45] uppercase">
                  {formatAccountType(account.type, locale)}
                </p>
                <p className="text-sm font-medium text-[#0B2340]">{account.name}</p>
              </div>
              <div className="text-sm text-[#5C6B64] sm:text-right">
                <p>
                  {t(locale, "account")}{" "}
                  <span className="tabular-nums font-medium text-[#0B2340]">
                    {account.accountNumber}
                  </span>
                </p>
                <p>
                  {t(locale, "routing")}{" "}
                  <span className="tabular-nums">{account.routingNumber}</span>
                  {" · "}
                  {formatMoney(account.balanceCents, moneyPrefs)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
      {banking.user.contacts.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-semibold text-[#0B2340]">{t(locale, "contacts")}</h2>
          <ul className="mt-4 grid gap-3">
            {banking.user.contacts.map((contact) => (
              <li
                key={contact.id}
                className="flex flex-col gap-1 rounded-xl bg-[#F7F6F2] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs tracking-[0.14em] text-[#2F7A45] uppercase">
                    {contactChannelLabel(contact.channel)}
                    {contact.isPrimary ? ` · ${t(locale, "primary")}` : ""}
                  </p>
                  <p className="text-sm font-medium text-[#0B2340]">{contact.label}</p>
                </div>
                <p className="text-sm text-[#5C6B64]">{contact.value}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="mt-8">
        <ProfileForm
          user={banking.user}
          allowPinChange={settings.allowMemberPinChange}
        />
      </section>
    </BankingScreen>
  );
}
