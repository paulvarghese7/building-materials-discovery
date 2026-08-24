import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-16 text-slate-950">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">BuildMatch</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          The page you requested does not exist. Return home or continue browsing the product
          catalogue.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-teal-700 px-4 py-2.5 font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          >
            Return home
          </Link>
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          >
            Browse products
          </Link>
        </div>
      </section>
    </main>
  );
}
