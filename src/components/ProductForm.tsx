"use client";

import { useState, FormEvent } from "react";
import { useProducts } from "@/hooks/useProducts";
import { writeProductOwnershipClient } from "@/lib/solid/pod.client";

/**
 * Product Form Component
 * Form to add new product ownership credentials
 */
export function ProductForm() {
  const { refresh } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    gtin: "",
    name: "",
    manufacturerId: "",
    manufacturerName: "",
    dppUrl: "",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Use client-side Pod operation with browser session's authenticated fetch
      const credentialUrl = await writeProductOwnershipClient(formData);
      
      setSuccess(`Product ownership credential added successfully! URL: ${credentialUrl}`);
      
      // Reset form
      setFormData({
        gtin: "",
        name: "",
        manufacturerId: "",
        manufacturerName: "",
        dppUrl: "",
      });

      // Refresh products list
      await refresh();
    } catch (err) {
      console.error("Add product error:", err);
      setError(err instanceof Error ? err.message : "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutoFill = () => {
    setError(null);
    setSuccess(null);
    setFormData({
      gtin: "9506000140445",
      name: "cote d or",
      manufacturerId: "did:web:cotedor",
      manufacturerName: "cotedor belgium",
      dppUrl: "https://tabulas.eu/cotedor",
    });
  };

  return (
    <div className="w-full p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
      <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
        Add Product Ownership
      </h2>

      {error && (
        <div className="mb-4 p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-950">
          <p className="text-sm text-green-800 dark:text-green-200">
            {success}
          </p>
        </div>
      )}

      <div className="mb-4">
        <button
          type="button"
          onClick={handleAutoFill}
          className="px-4 py-2 rounded-md bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-zinc-200 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors text-sm font-medium"
        >
          Auto-fill Sample Data
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="gtin"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            GTIN <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="gtin"
            name="gtin"
            value={formData.gtin}
            onChange={handleChange}
            required
            placeholder="5400141072853"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Côte d'Or Dark Chocolate 70%"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="manufacturerId"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Manufacturer ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="manufacturerId"
            name="manufacturerId"
            value={formData.manufacturerId}
            onChange={handleChange}
            required
            placeholder="did:web:cotedor.be"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="manufacturerName"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            Manufacturer Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="manufacturerName"
            name="manufacturerName"
            value={formData.manufacturerName}
            onChange={handleChange}
            required
            placeholder="Côte d'Or Belgium"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="dppUrl"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
          >
            DPP Source URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="dppUrl"
            name="dppUrl"
            value={formData.dppUrl}
            onChange={handleChange}
            required
            placeholder="https://tabulas.eu/dpp/5400141072853"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-black text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Adding..." : "Add Product Ownership"}
        </button>
      </form>
    </div>
  );
}
