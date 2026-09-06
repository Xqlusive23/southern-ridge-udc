export default function AdminConsoleLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse">
      <div className="h-3 w-24 rounded bg-[#d9e0d8]" />
      <div className="mt-3 h-9 w-56 rounded bg-[#d9e0d8]" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-24 rounded-2xl bg-[#d9e0d8]/80" />
        ))}
      </div>
      <div className="mt-6 h-72 rounded-2xl bg-[#d9e0d8]/70" />
    </div>
  );
}
