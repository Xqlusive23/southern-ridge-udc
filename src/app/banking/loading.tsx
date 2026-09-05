export default function BankingLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <div className="h-8 w-56 rounded bg-[#D9E0D8]" />
      <div className="mt-4 h-10 w-40 rounded bg-[#D9E0D8]" />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="h-40 rounded-2xl bg-[#D9E0D8]" />
        <div className="h-40 rounded-2xl bg-[#D9E0D8]" />
      </div>
    </div>
  );
}
