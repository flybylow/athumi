"use client";

import {
  getSolidDataset,
  createSolidDataset,
  saveSolidDatasetAt,
  createThing,
  setThing,
  getThing,
  getStringNoLocale,
  getUrl,
  getDatetime,
  getContainedResourceUrlAll,
  createContainerAt,
  setUrl,
  setDatetime,
  setStringNoLocale,
} from "@inrupt/solid-client";
import { RDF, SCHEMA_INRUPT } from "@inrupt/vocab-common-rdf";
import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import type { ProductInput, ProductOwnership } from "@/lib/schemas/product-ownership";
import { TABULAS_NS, GS1_NS } from "@/lib/schemas/product-ownership";

/**
 * Client-side Pod operations for product ownership credentials
 * Uses browser session's authenticated fetch (tokens managed internally by SDK)
 */

/**
 * Get the Pod root URL from WebID
 */
function getPodRoot(webId: string): string {
  const url = new URL(webId);
  const pathParts = url.pathname.split("/").filter(Boolean);
  
  if (pathParts.length >= 2 && pathParts[pathParts.length - 2] === "profile") {
    pathParts.pop();
    pathParts.pop();
  }
  
  return `${url.protocol}//${url.host}/${pathParts.join("/")}`;
}

/**
 * Get or create the products container
 */
async function ensureProductsContainer(
  podRoot: string,
  fetch: typeof globalThis.fetch
): Promise<string> {
  const containerUrl = `${podRoot}/products/`;
  
  try {
    await getSolidDataset(containerUrl, { fetch });
    return containerUrl;
  } catch (error) {
    try {
      await createContainerAt(containerUrl, { fetch });
      return containerUrl;
    } catch (createError) {
      console.error("Failed to create products container:", createError);
      throw new Error("Failed to create products container");
    }
  }
}

/**
 * Write a product ownership credential to the Pod (client-side)
 */
export async function writeProductOwnershipClient(
  product: ProductInput
): Promise<string> {
  const session = getDefaultSession();

  if (!session.info.isLoggedIn || !session.info.webId) {
    throw new Error("Not authenticated");
  }

  if (!session.fetch) {
    throw new Error("Session does not have authenticated fetch");
  }

  const webId = session.info.webId;
  const podRoot = getPodRoot(webId);
  const containerUrl = await ensureProductsContainer(podRoot, session.fetch);
  const credentialUrl = `${containerUrl}${product.gtin}`;

  let credential = createThing({ url: credentialUrl });
  credential = setUrl(credential, RDF.type, `${TABULAS_NS}OwnershipCredential`);
  credential = setStringNoLocale(credential, `${GS1_NS}gtin`, product.gtin);
  credential = setStringNoLocale(credential, SCHEMA_INRUPT.name, product.name);
  credential = setUrl(credential, `${TABULAS_NS}manufacturer`, product.manufacturerId);
  credential = setStringNoLocale(credential, `${TABULAS_NS}manufacturerName`, product.manufacturerName);
  credential = setUrl(credential, `${TABULAS_NS}owner`, webId);
  credential = setDatetime(credential, `${TABULAS_NS}issuedAt`, new Date());
  credential = setUrl(credential, `${TABULAS_NS}issuedBy`, "did:web:tabulas.eu");
  credential = setUrl(credential, `${TABULAS_NS}dppSource`, product.dppUrl);

  let dataset;
  try {
    dataset = await getSolidDataset(credentialUrl, { fetch: session.fetch });
  } catch (e) {
    dataset = createSolidDataset();
  }

  dataset = setThing(dataset, credential);
  await saveSolidDatasetAt(credentialUrl, dataset, { fetch: session.fetch });
  
  console.log("Product ownership credential saved to:", credentialUrl);

  return credentialUrl;
}

/**
 * Read a product ownership credential from the Pod (client-side)
 */
export async function readProductOwnershipClient(
  credentialUrl: string
): Promise<ProductOwnership> {
  const session = getDefaultSession();

  if (!session.info.isLoggedIn || !session.fetch) {
    throw new Error("Not authenticated");
  }

  const dataset = await getSolidDataset(credentialUrl, {
    fetch: session.fetch,
  });
  const credential = getThing(dataset, credentialUrl);

  if (!credential) {
    throw new Error(`Credential not found at ${credentialUrl}`);
  }

  return {
    url: credentialUrl,
    gtin: getStringNoLocale(credential, `${GS1_NS}gtin`) || "",
    name: getStringNoLocale(credential, SCHEMA_INRUPT.name) || "",
    manufacturerId: getUrl(credential, `${TABULAS_NS}manufacturer`),
    manufacturerName: getStringNoLocale(
      credential,
      `${TABULAS_NS}manufacturerName`
    ),
    owner: getUrl(credential, `${TABULAS_NS}owner`),
    issuedAt: getDatetime(credential, `${TABULAS_NS}issuedAt`),
    dppSource: getUrl(credential, `${TABULAS_NS}dppSource`),
  };
}

/**
 * List all owned products from the Pod (client-side)
 */
export async function listOwnedProductsClient(): Promise<ProductOwnership[]> {
  const session = getDefaultSession();

  if (!session.info.isLoggedIn || !session.info.webId || !session.fetch) {
    throw new Error("Not authenticated");
  }

  const webId = session.info.webId;
  const podRoot = getPodRoot(webId);
  const containerUrl = `${podRoot}/products/`;

  try {
    // Try to get the container - if it doesn't exist, return empty array
    let containerDataset;
    try {
      containerDataset = await getSolidDataset(containerUrl, {
        fetch: session.fetch,
      });
    } catch (error) {
      // Container doesn't exist yet - return empty array
      if ((error as Error).message.includes("404") || (error as any).response?.status === 404) {
        return [];
      }
      throw error;
    }

    const resourceUrls = getContainedResourceUrlAll(containerDataset);
    console.log("Found resource URLs in container:", resourceUrls);
    
    const products: ProductOwnership[] = [];

    for (const resourceUrl of resourceUrls) {
      try {
        console.log("Reading product from:", resourceUrl);
        const product = await readProductOwnershipClient(resourceUrl);
        products.push(product);
      } catch (error) {
        console.error(`Failed to read product at ${resourceUrl}:`, error);
      }
    }

    console.log("Total products found:", products.length);
    return products;
  } catch (error) {
    // If we get any other error, return empty array for graceful degradation
    console.error("Error listing products:", error);
    return [];
  }
}
