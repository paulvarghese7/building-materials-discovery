import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <main className="grid flex-1 place-items-center bg-slate-50 px-4 py-16 text-slate-950">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-700">
          BuildMatch catalogue
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Product not found
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          This product ID does not match an item in the catalogue. It may be incorrect or no
          longer available.
        </p>
        <Link
          href="/products"
          className="mt-7 inline-flex min-h-11 items-center rounded-md bg-brand-700 px-4 py-2.5 font-semibold text-white hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700"
        >
          Browse all products
        </Link>
      </section>
    </main>
  );
}
