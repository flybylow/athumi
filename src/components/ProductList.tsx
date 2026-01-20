"use client";

import { useState, useEffect, useRef } from "react";
import type { ProductOwnership } from "@/lib/schemas/product-ownership";
import { ProductCard } from "./ProductCard";
import { deleteProductOwnershipClient } from "@/lib/solid/pod.client";
import { showToast } from "./Toast";

/**
 * Product List Component
 * Displays all owned products from the user's Pod
 */
interface ProductListProps {
  products: ProductOwnership[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  removeProduct: (credentialUrl: string) => void;
  newlyAddedUrl?: string | null;
}

export function ProductList({
  products,
  isLoading,
  error,
  refresh,
  removeProduct,
  newlyAddedUrl,
}: ProductListProps) {
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());
  const previousProductsRef = useRef<string[]>([]);

  // Sort products by issuedAt date (newest first)
  const sortedProducts = [...products].sort((a, b) => {
    const dateA = a.issuedAt ? new Date(a.issuedAt).getTime() : 0;
    const dateB = b.issuedAt ? new Date(b.issuedAt).getTime() : 0;
    return dateB - dateA; // Newest first
  });

  const handleDelete = async (credentialUrl: string) => {
    try {
      await deleteProductOwnershipClient(credentialUrl);
      // Remove product from local state immediately (optimistic update)
      // No need to refresh from Pod - avoids race conditions with container listings
      removeProduct(credentialUrl);
      // Show success toast notification
      showToast("Product ownership credential deleted successfully!", "success");
    } catch (error) {
      console.error("Delete error:", error);
      // Show error toast notification
      showToast(
        error instanceof Error ? error.message : "Failed to delete product",
        "error"
      );
      throw error; // Re-throw to let ProductCard handle error state
    }
  };

  // Track newly added product URL when passed as prop
  useEffect(() => {
    if (newlyAddedUrl) {
      // Wait for next frame to ensure DOM is ready, then mark as new
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setNewlyAddedIds((prev) => new Set([...prev, newlyAddedUrl]));
          
          // Remove the "new" class after animation completes (3 seconds for 3 pulses)
          setTimeout(() => {
            setNewlyAddedIds((prev) => {
              const updated = new Set(prev);
              updated.delete(newlyAddedUrl);
              return updated;
            });
          }, 6000);
        });
      });
    }
  }, [newlyAddedUrl]);

  // Track newly added products from list changes (fallback)
  useEffect(() => {
    if (products.length > 0 && previousProductsRef.current.length > 0) {
      // Only track new products if we had products before (not on initial load)
      const currentUrls = products.map((p) => p.url);
      const previousUrls = previousProductsRef.current;

      // Find newly added products (products that exist now but didn't before)
      const newUrls = currentUrls.filter((url) => !previousUrls.includes(url));

      if (newUrls.length > 0 && !newlyAddedUrl) {
        // Only use this as fallback if newlyAddedUrl wasn't provided
        // Add new product URLs to the newlyAdded set with a small delay to ensure DOM is ready
        requestAnimationFrame(() => {
          setNewlyAddedIds((prev) => {
            const updated = new Set(prev);
            newUrls.forEach((url) => updated.add(url));
            return updated;
          });

          // Remove the "new" class after animation completes
          setTimeout(() => {
            setNewlyAddedIds((prev) => {
              const updated = new Set(prev);
              newUrls.forEach((url) => updated.delete(url));
              return updated;
            });
          }, 2500);
        });
      }

      // Update previous products ref
      previousProductsRef.current = currentUrls;
    } else if (products.length > 0 && previousProductsRef.current.length === 0) {
      // Initial load - set previous products but don't mark as new
      previousProductsRef.current = products.map((p) => p.url);
    } else if (products.length === 0) {
      // Reset when products list is empty
      previousProductsRef.current = [];
      setNewlyAddedIds(new Set());
    }
  }, [products, newlyAddedUrl]);

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
      <div className="flex flex-col gap-3">
        {sortedProducts.map((product) => (
          <ProductCard
            key={product.url}
            product={product}
            isNew={newlyAddedIds.has(product.url)}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
