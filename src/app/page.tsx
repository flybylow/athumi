"use client";

import { AuthButton } from "@/components/AuthButton";
import { ProductForm } from "@/components/ProductForm";
import { ProductList } from "@/components/ProductList";
import { useSolidSession } from "@/hooks/useSolidSession";

export default function Home() {
  const { session, isLoading } = useSolidSession();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-start justify-start py-16 px-8 bg-white dark:bg-black sm:px-16">
        <div className="w-full mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-2">
            Athumi Solid Pod Integration
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            POC for Solid Pod integration with cookie-based authentication
          </p>
        </div>

        <div className="w-full mb-8 p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
            Authentication
          </h2>
          <AuthButton />
        </div>

        {session.isLoggedIn && (
          <>
            <div className="w-full p-6 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-950 mb-8">
              <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">
                Session Status
              </h2>
              <div className="space-y-2">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <span className="font-medium">Status:</span>{" "}
                  <span className="text-green-600 dark:text-green-400">
                    Authenticated
                  </span>
                </p>
                <p className="text-sm text-green-800 dark:text-green-200 break-all">
                  <span className="font-medium">WebID:</span>{" "}
                  <span className="text-green-600 dark:text-green-400">
                    {session.webId}
                  </span>
                </p>
              </div>
            </div>

            <div className="w-full mb-8">
              <ProductForm />
            </div>

            <div className="w-full">
              <ProductList />
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
