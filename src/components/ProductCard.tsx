"use client";

import { useState } from "react";
import type { ProductOwnership } from "@/lib/schemas/product-ownership";
import { showToast } from "./Toast";

interface ProductCardProps {
  product: ProductOwnership;
  isNew?: boolean;
  onDelete?: (credentialUrl: string) => Promise<void>;
}

/**
 * Product Card Component
 * Displays individual product ownership credential details (collapsible)
 */
export function ProductCard({
  product,
  isNew = false,
  onDelete,
}: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;

    try {
      setIsDeleting(true);
      await onDelete(product.url);
      // Toast notification is handled in ProductList's handleDelete
      // Just close the confirmation dialog on success
      setShowConfirm(false);
    } catch (error) {
      // Error toast is already shown in ProductList's handleDelete
      // Just close the confirmation dialog so user can try again
      setShowConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <div
      className={`border rounded-lg bg-white dark:bg-black transition-all duration-300 ${
        isNew
          ? "border-green-500 dark:border-green-400 shadow-xl shadow-green-300/50 dark:shadow-green-600/50 ring-4 ring-green-300/50 dark:ring-green-600/50 animate-pulse-glow"
          : "border-zinc-200 dark:border-zinc-800 hover:shadow-md"
      }`}
    >
      <div className="p-4 flex items-center justify-between gap-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 min-w-0 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors rounded-md -ml-2 -mr-2 px-2 py-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-black dark:text-zinc-50 truncate">
                {product.name || "Unnamed Product"}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                GTIN: <span className="font-mono">{product.gtin}</span>
              </p>
            </div>
            <svg
              className={`w-5 h-5 text-zinc-500 dark:text-zinc-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {/* Delete button - always visible */}
        {onDelete && (
          <div className="flex-shrink-0">
            {showConfirm ? (
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelDelete();
                  }}
                  disabled={isDeleting}
                  className="px-3 py-1 text-xs rounded-md bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-zinc-200 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirmDelete();
                  }}
                  disabled={isDeleting}
                  className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Confirm"}
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick();
                }}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 animate-slide-down">

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
      )}
    </div>
  );
}
