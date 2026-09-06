export default function BankingTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="banking-page-enter h-full min-h-full">{children}</div>;
}
