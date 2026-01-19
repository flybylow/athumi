"use client";

import type { ProductOwnership } from "@/lib/schemas/product-ownership";

interface ProductCardProps {
  product: ProductOwnership;
}

/**
 * Product Card Component
 * Displays individual product ownership credential details
 */
export function ProductCard({ product }: ProductCardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-black hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-1">
            {product.name || "Unnamed Product"}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            GTIN: <span className="font-mono">{product.gtin}</span>
          </p>
        </div>

        {product.manufacturerName && (
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Manufacturer
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {product.manufacturerName}
            </p>
            {product.manufacturerId && (
              <p className="text-xs text-zinc-500 dark:text-zinc-500 break-all">
                {product.manufacturerId}
              </p>
            )}
          </div>
        )}

        {product.issuedAt && (
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Issued At
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {formatDate(product.issuedAt)}
            </p>
          </div>
        )}

        {product.dppSource && (
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              DPP Source
            </p>
            <a
              href={product.dppSource}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
            >
              {product.dppSource}
            </a>
          </div>
        )}

        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-500 break-all">
            {product.url}
          </p>
        </div>
      </div>
    </div>
  );
}
