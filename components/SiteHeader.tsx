'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SiteHeader() {
  const pathname = usePathname();
  const showHomeLink = pathname !== '/';
  const showProductsLink = pathname !== '/products';

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded text-xl font-bold tracking-tight text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700"
          aria-label="BuildMatch home"
        >
          Build<span className="text-brand-700">Match</span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Primary navigation">
          {showHomeLink && (
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-md px-3 font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
            >
              Home
            </Link>
          )}
          {showProductsLink && (
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center rounded-md px-3 font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
            >
              Products
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
