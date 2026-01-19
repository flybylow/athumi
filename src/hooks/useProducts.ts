"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProductOwnership } from "@/lib/schemas/product-ownership";
import { listOwnedProductsClient } from "@/lib/solid/pod.client";

export interface UseProductsResult {
  products: ProductOwnership[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * React hook to fetch and manage products list
 */
export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<ProductOwnership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use client-side Pod operation with browser session's authenticated fetch
      const productsList = await listOwnedProductsClient();
      setProducts(productsList);
    } catch (err) {
      console.error("Products fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    refresh: fetchProducts,
  };
}

export interface UseProductResult {
  product: ProductOwnership | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * React hook to fetch a single product by GTIN
 */
export function useProduct(gtin: string | null): UseProductResult {
  const [product, setProduct] = useState<ProductOwnership | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!gtin) {
      setProduct(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/products/read?gtin=${encodeURIComponent(gtin)}`);

      if (!response.ok) {
        if (response.status === 404) {
          setProduct(null);
          return;
        }
        throw new Error("Failed to fetch product");
      }

      const data = await response.json();

      // Convert ISO date string back to Date object
      const productWithDate: ProductOwnership = {
        ...data.product,
        issuedAt: data.product.issuedAt
          ? new Date(data.product.issuedAt)
          : null,
      };

      setProduct(productWithDate);
    } catch (err) {
      console.error("Product fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch product");
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, [gtin]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    isLoading,
    error,
    refresh: fetchProduct,
  };
}
