"use client";

import { useState, FormEvent } from "react";
import type { ProductOwnership } from "@/lib/schemas/product-ownership";
import { writeProductOwnershipClient, readProductOwnershipClient } from "@/lib/solid/pod.client";
import { showToast } from "./Toast";

/**
 * Product Form Component
 * Form to add new product ownership credentials
 */
interface ProductFormProps {
  onProductAdded?: (product: ProductOwnership) => string;
}

export function ProductForm({ onProductAdded }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    gtin: "",
    name: "",
    manufacturerId: "",
    manufacturerName: "",
    dppUrl: "",
  });

  const submitForm = async (data: typeof formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Use client-side Pod operation with browser session's authenticated fetch
      const credentialUrl = await writeProductOwnershipClient(data);
      
      // Read the product back to get the full ProductOwnership object
      const product = await readProductOwnershipClient(credentialUrl);
      
      // Show success toast notification
      showToast("Product ownership credential added successfully!", "success");
      
      // Reset form
      setFormData({
        gtin: "",
        name: "",
        manufacturerId: "",
        manufacturerName: "",
        dppUrl: "",
      });

      // Add product directly to the list (no refresh needed)
      if (onProductAdded) {
        return onProductAdded(product);
      }
    } catch (err) {
      console.error("Add product error:", err);
      setError(err instanceof Error ? err.message : "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitForm(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRandomFill = () => {
    setError(null);

    // Sample product names
    const productNames = [
      "Organic Coffee Beans Dark Roast",
      "Premium Chocolate Bar 85% Cocoa",
      "Handmade Artisan Bread",
      "Natural Honey 500g",
      "Fresh Olive Oil Extra Virgin",
      "Wild Salmon Fillet",
      "Organic Green Tea",
      "Artisan Cheese Aged 12 Months",
      "Fresh Mango from India",
      "Organic Quinoa 1kg",
      "Handcrafted Soap Lavender",
      "Premium Wine Cabernet Sauvignon",
      "Organic Almonds Raw",
      "Fresh Avocados Hass",
      "Wild Caught Tuna Steak",
    ];

    // Sample manufacturer names
    const manufacturers = [
      { id: "did:web:organico.be", name: "Organico Belgium" },
      { id: "did:web:artisan.nl", name: "Artisan Netherlands" },
      { id: "did:web:premium.fr", name: "Premium France" },
      { id: "did:web:nature.de", name: "Nature Germany" },
      { id: "did:web:fresh.it", name: "Fresh Italy" },
      { id: "did:web:organic.es", name: "Organic Spain" },
      { id: "did:web:wild.eu", name: "Wild Europe" },
      { id: "did:web:handcraft.uk", name: "Handcraft UK" },
    ];

    // Generate random 13-digit GTIN (EAN-13 format)
    const generateGTIN = () => {
      let gtin = "";
      for (let i = 0; i < 12; i++) {
        gtin += Math.floor(Math.random() * 10).toString();
      }
      // Calculate check digit (simplified)
      const checkDigit = Math.floor(Math.random() * 10);
      return gtin + checkDigit;
    };

    // Pick random values
    const randomProductName = productNames[Math.floor(Math.random() * productNames.length)];
    const randomManufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    const randomGTIN = generateGTIN();

    // Fill form with random data
    setFormData({
      gtin: randomGTIN,
      name: randomProductName,
      manufacturerId: randomManufacturer.id,
      manufacturerName: randomManufacturer.name,
      dppUrl: `https://tabulas.eu/dpp/${randomGTIN}`,
    });
  };

  return (
    <div className="w-full p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
          Digital Product Passport
        </h2>
        <button
          type="button"
          onClick={handleRandomFill}
          className="px-4 py-2 rounded-md bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 hover:bg-purple-300 dark:hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          Random Fill
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

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
          {isSubmitting ? "Adding..." : "Add to Personal Vault"}
        </button>
      </form>
    </div>
  );
}
