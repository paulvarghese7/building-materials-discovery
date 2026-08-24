export default function ProductsLoading() {
  return (
    <main className="flex-1 bg-slate-50 text-slate-950" aria-busy="true">
      <p className="sr-only" role="status">
        Loading product catalogue
      </p>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl animate-pulse px-4 py-12 sm:px-6 sm:py-16 lg:px-8" aria-hidden="true">
          <div className="h-4 w-44 rounded bg-slate-200" />
          <div className="mt-4 h-12 w-56 rounded bg-slate-200" />
          <div className="mt-5 h-6 max-w-xl rounded bg-slate-200" />
        </div>
      </header>

      <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 sm:py-12 lg:px-8" aria-hidden="true">
        <div className="h-32 rounded-2xl border border-slate-200 bg-white" />
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <div className="h-80 rounded-2xl border border-slate-200 bg-white" />
          <div>
            <div className="h-10 rounded bg-slate-200" />
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="h-72 rounded-2xl border border-slate-200 bg-white" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
