'use client';

import { useEffect, useId, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import {
  getCatalogueSuggestions,
  type CatalogueSuggestion,
} from '@/lib/catalogue-search';
import {
  MAX_SEARCH_QUERY_LENGTH,
  createCatalogueHref,
  type CatalogueFilters,
} from '@/lib/products';
import type { Product } from '@/types';

interface SearchInputProps {
  filters: CatalogueFilters;
  products: readonly Product[];
  variant?: 'catalogue' | 'homepage';
}

const catalogueFormClassName =
  'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-3 sm:p-5';
const homepageFormClassName =
  'mt-9 max-w-2xl rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm sm:flex sm:items-end sm:gap-3';

export function SearchInput({ filters, products, variant = 'catalogue' }: SearchInputProps) {
  const router = useRouter();
  const listboxId = useId();
  const inputId = variant === 'homepage' ? 'homepage-product-search' : 'product-search';
  const hintId = `${inputId}-hint`;
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [inputValue, setInputValue] = useState(filters.query);
  const [lastServerQuery, setLastServerQuery] = useState(filters.query);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isPending, startTransition] = useTransition();
  const suggestions = useMemo(
    () => getCatalogueSuggestions(products, inputValue, filters),
    [filters, inputValue, products],
  );
  const showSuggestions = isOpen && suggestions.length > 0;

  if (filters.query !== lastServerQuery) {
    setLastServerQuery(filters.query);
    setInputValue(filters.query);
    setActiveIndex(-1);
  }

  useEffect(
    () => () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    },
    [],
  );

  function clearDebounce(): void {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = undefined;
    }
  }

  function navigateTo(href: string, replace = false): void {
    clearDebounce();
    setIsOpen(false);
    setActiveIndex(-1);
    startTransition(() => {
      if (replace) {
        router.replace(href, { scroll: false });
      } else {
        router.push(href, { scroll: false });
      }
    });
  }

  function applySearch(query: string): void {
    navigateTo(createCatalogueHref({ ...filters, query }), variant === 'catalogue');
  }

  function scheduleCatalogueSearch(query: string): void {
    clearDebounce();
    debounceTimer.current = setTimeout(() => {
      debounceTimer.current = undefined;
      startTransition(() => {
        router.replace(createCatalogueHref({ ...filters, query }), { scroll: false });
      });
    }, 300);
  }

  function selectSuggestion(suggestion: CatalogueSuggestion): void {
    if (suggestion.type === 'search') {
      applySearch(inputValue);
      return;
    }

    navigateTo(suggestion.href);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === 'Enter' && showSuggestions && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
      return;
    }

    if (event.key === 'Tab') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <form
      action="/products"
      method="get"
      role="search"
      aria-busy={isPending || undefined}
      className={variant === 'homepage' ? homepageFormClassName : catalogueFormClassName}
      onSubmit={(event) => {
        event.preventDefault();
        applySearch(inputValue);
      }}
    >
      <div className="relative min-w-0 flex-1">
        <label htmlFor={inputId} className="block text-sm font-semibold text-slate-900">
          {variant === 'homepage' ? 'Search products' : 'Search the catalogue'}
        </label>
        {variant === 'catalogue' && (
          <p id={hintId} className="mt-1 text-sm leading-6 text-slate-600">
            Search by product name, SKU, product type, or performance need.
          </p>
        )}

        {filters.category && <input type="hidden" name="category" value={filters.category} />}
        {filters.need && <input type="hidden" name="need" value={filters.need} />}

        <input
          id={inputId}
          name="q"
          type="search"
          role="combobox"
          value={inputValue}
          maxLength={MAX_SEARCH_QUERY_LENGTH}
          required={variant === 'homepage'}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={showSuggestions}
          aria-activedescendant={
            showSuggestions && activeIndex >= 0
              ? `${listboxId}-${suggestions[activeIndex].id}`
              : undefined
          }
          aria-describedby={variant === 'catalogue' ? hintId : undefined}
          placeholder={
            variant === 'homepage'
              ? 'Try a product name, SKU, or requirement'
              : 'Search products, SKUs, or requirements'
          }
          className={`${variant === 'homepage' ? 'mt-2 min-h-12' : 'mt-3 min-h-11'} w-full rounded-lg border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none placeholder:text-slate-500 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20`}
          onChange={(event) => {
            const nextValue = event.target.value;
            setInputValue(nextValue);
            setIsOpen(true);
            setActiveIndex(-1);

            if (variant === 'catalogue') {
              scheduleCatalogueSearch(nextValue);
            }
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            setIsOpen(false);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
        />

        {showSuggestions && (
          <div
            id={listboxId}
            role="listbox"
            aria-label="Search suggestions"
            className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                id={`${listboxId}-${suggestion.id}`}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={activeIndex === index}
                className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm ${
                  activeIndex === index
                    ? 'bg-teal-50 text-teal-950'
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion.type === 'product' ? (
                  <>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{suggestion.name}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">Product</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-slate-500">
                      {suggestion.sku}
                    </span>
                  </>
                ) : (
                  <span className="min-w-0">
                    <span className="block font-semibold">{suggestion.label}</span>
                    {suggestion.type === 'discovery' && (
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {suggestion.description}
                      </span>
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        className={`${variant === 'homepage' ? 'mt-3 min-h-12 w-full sm:mt-0 sm:w-auto' : 'mt-3 min-h-11 w-full sm:mt-0 sm:w-auto'} inline-flex items-center justify-center rounded-lg bg-teal-800 px-5 py-2 font-semibold text-white transition-colors hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700`}
      >
        {variant === 'homepage' ? 'Search catalogue' : 'Search'}
      </button>
    </form>
  );
}
