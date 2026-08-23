import { MAX_SEARCH_QUERY_LENGTH, type CatalogueFilters } from '@/lib/products';

interface SearchInputProps {
  filters: CatalogueFilters;
}

// Uses a GET form so submitted searches remain shareable without client-side state.
export function SearchInput({ filters }: SearchInputProps) {
  const formKey = [filters.query, filters.category, filters.need].join(':');

  return (
    <form
      key={formKey}
      action="/products"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      role="search"
    >
      <label htmlFor="product-search" className="block text-sm font-semibold text-slate-900">
        Search the catalogue
      </label>
      <p id="product-search-hint" className="mt-1 text-sm leading-6 text-slate-600">
        Search by product name, SKU, product type, or performance need.
      </p>

      {filters.category && <input type="hidden" name="category" value={filters.category} />}
      {filters.need && <input type="hidden" name="need" value={filters.need} />}

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          id="product-search"
          name="q"
          type="search"
          defaultValue={filters.query}
          maxLength={MAX_SEARCH_QUERY_LENGTH}
          aria-describedby="product-search-hint"
          placeholder="Search products, SKUs, or requirements"
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-base text-slate-950 outline-none placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
        />
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-teal-800 px-5 py-2 font-semibold text-white transition-colors hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          Search
        </button>
      </div>
    </form>
  );
}
