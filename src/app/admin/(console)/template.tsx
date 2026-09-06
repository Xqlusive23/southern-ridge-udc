export default function AdminConsoleTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-page-enter w-full min-w-0 overflow-x-hidden">{children}</div>;
}
