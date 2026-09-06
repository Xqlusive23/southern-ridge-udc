export default function BankingLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <div className="h-3 w-24 rounded bg-[#d9e0d8]" />
      <div className="mt-3 h-9 w-64 rounded bg-[#d9e0d8]" />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="aspect-[1.62/1] rounded-[1.35rem] bg-[#d9e0d8]/80" />
        <div className="aspect-[1.62/1] rounded-[1.35rem] bg-[#d9e0d8]/70" />
      </div>
    </div>
  );
}
