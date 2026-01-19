"use client";

import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "./ProductCard";

/**
 * Product List Component
 * Displays all owned products from the user's Pod
 */
export function ProductList() {
  const { products, isLoading, error, refresh } = useProducts();

  if (isLoading) {
    return (
      <div className="w-full p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-50"></div>
          <span className="ml-3 text-zinc-600 dark:text-zinc-400">
            Loading products...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
          Error Loading Products
        </h3>
        <p className="text-sm text-red-800 dark:text-red-200 mb-4">{error}</p>
        <button
          onClick={refresh}
          className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-2">
          Owned Products
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400">
          No products found. Add a product ownership credential to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
          Owned Products ({products.length})
        </h3>
        <button
          onClick={refresh}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Refresh
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.url} product={product} />
        ))}
      </div>
    </div>
  );
}
