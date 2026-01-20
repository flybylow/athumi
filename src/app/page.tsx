"use client";

import { useState } from "react";
import { AuthButton } from "@/components/AuthButton";
import { ProductForm } from "@/components/ProductForm";
import { ProductList } from "@/components/ProductList";
import { useSolidSession } from "@/hooks/useSolidSession";
import { useProducts } from "@/hooks/useProducts";

export default function Home() {
  const { session, isLoading } = useSolidSession();
  const { products, isLoading: productsLoading, error, refresh, addProduct, removeProduct } = useProducts();
  const [newlyAddedUrl, setNewlyAddedUrl] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-start justify-start py-16 px-8 bg-white dark:bg-black sm:px-16">
        <div className="w-full mb-8 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-2">
              Athumi Solid Pod
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              POC for Solid Pod integration with cookie-based authentication
            </p>
          </div>
          <div className="flex-shrink-0">
            <AuthButton />
          </div>
        </div>

        {session.isLoggedIn && (
          <>
            <div className="w-full mb-8">
              <ProductForm 
                onProductAdded={(product) => {
                  const url = addProduct(product);
                  setNewlyAddedUrl(url);
                  // Clear after a bit so the prop change can trigger animation again if needed
                  setTimeout(() => setNewlyAddedUrl(null), 100);
                }} 
              />
            </div>

            <div className="w-full">
              <ProductList
                products={products}
                isLoading={productsLoading}
                error={error}
                refresh={refresh}
                removeProduct={removeProduct}
                newlyAddedUrl={newlyAddedUrl}
              />
            </div>
          </>
        )}

        {!session.isLoggedIn && !isLoading && (
          <div className="w-full p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
              Getting Started
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-zinc-600 dark:text-zinc-400">
              <li>Click "Login with Solid" to authenticate with Community Solid Server</li>
              <li>Create an account on the Solid server if you don't have one</li>
              <li>After authentication, your session will be stored securely</li>
              <li>You can then access your Solid Pod for product ownership credentials</li>
            </ol>
          </div>
        )}
      </main>
    </div>
  );
}
