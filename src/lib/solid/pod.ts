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
import { Session } from "@inrupt/solid-client-authn-node";
import { getSolidNodeSession } from "./auth.server";
import type { ProductInput, ProductOwnership } from "@/lib/schemas/product-ownership";
import { TABULAS_NS, GS1_NS } from "@/lib/schemas/product-ownership";

/**
 * Pod operations for product ownership credentials
 * Uses Solid Node.js SDK with authenticated sessions
 */

/**
 * Get the Pod root URL from WebID
 */
function getPodRoot(webId: string): string {
  // Extract Pod root from WebID (e.g., http://localhost:3000/warddem/profile/card#me -> http://localhost:3000/warddem)
  const url = new URL(webId);
  const pathParts = url.pathname.split("/").filter(Boolean);
  
  // Remove /profile/card from path to get Pod root
  if (pathParts.length >= 2 && pathParts[pathParts.length - 2] === "profile") {
    pathParts.pop(); // Remove "card" or last part
    pathParts.pop(); // Remove "profile"
  }
  
  return `${url.protocol}//${url.host}/${pathParts.join("/")}`;
}

/**
 * Get or create the products container
 */
async function ensureProductsContainer(
  podRoot: string,
  session: Session
): Promise<string> {
  const containerUrl = `${podRoot}/products/`;
  
  try {
    // Try to get the container
    await getSolidDataset(containerUrl, { fetch: session.fetch });
    return containerUrl;
  } catch (error) {
    // Container doesn't exist, create it
    try {
      await createContainerAt(containerUrl, { fetch: session.fetch });
      return containerUrl;
    } catch (createError) {
      console.error("Failed to create products container:", createError);
      throw new Error("Failed to create products container");
    }
  }
}

/**
 * Write a product ownership credential to the Pod
 */
export async function writeProductOwnership(
  product: ProductInput
): Promise<string> {
  const sessionData = await getSolidNodeSession();
  
  if (!sessionData || !sessionData.info.webId) {
    throw new Error("Not authenticated");
  }

  if (!sessionData.fetch) {
    throw new Error("Session does not have authenticated fetch - tokens may be missing");
  }

  const webId = sessionData.info.webId;
  const podRoot = getPodRoot(webId);
  
  // Ensure products container exists
  const containerUrl = await ensureProductsContainer(podRoot, sessionData);
  const credentialUrl = `${containerUrl}${product.gtin}`;

  // Create the credential as a Solid Thing
  let credential = createThing({ url: credentialUrl });

  // Set RDF type
  credential = setUrl(credential, RDF.type, `${TABULAS_NS}OwnershipCredential`);

  // Product details
  credential = setStringNoLocale(credential, `${GS1_NS}gtin`, product.gtin);
  credential = setStringNoLocale(credential, SCHEMA_INRUPT.name, product.name);
  credential = setUrl(credential, `${TABULAS_NS}manufacturer`, product.manufacturerId);
  credential = setStringNoLocale(
    credential,
    `${TABULAS_NS}manufacturerName`,
    product.manufacturerName
  );

  // Ownership
  credential = setUrl(credential, `${TABULAS_NS}owner`, webId);
  credential = setDatetime(credential, `${TABULAS_NS}issuedAt`, new Date());
  credential = setUrl(credential, `${TABULAS_NS}issuedBy`, "did:web:tabulas.eu");

  // DPP reference
  credential = setUrl(credential, `${TABULAS_NS}dppSource`, product.dppUrl);

  // Create or get the dataset
  let dataset;
  try {
    dataset = await getSolidDataset(credentialUrl, {
      fetch: sessionData.fetch,
    });
  } catch (e) {
    // Resource doesn't exist, create new dataset
    dataset = createSolidDataset();
  }

  // Add credential to dataset
  dataset = setThing(dataset, credential);

  // Save to Pod
  await saveSolidDatasetAt(credentialUrl, dataset, {
    fetch: sessionData.fetch,
  });

  return credentialUrl;
}

/**
 * Read a product ownership credential from the Pod
 */
export async function readProductOwnership(
  credentialUrl: string
): Promise<ProductOwnership> {
  const sessionData = await getSolidNodeSession();

  if (!sessionData || !sessionData.info.isLoggedIn) {
    throw new Error("Not authenticated");
  }

  const dataset = await getSolidDataset(credentialUrl, {
    fetch: sessionData.fetch,
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
 * Read a product ownership credential by GTIN
 */
export async function readProductOwnershipByGtin(
  gtin: string
): Promise<ProductOwnership> {
  const sessionData = await getSolidNodeSession();

  if (!sessionData || !sessionData.info.webId) {
    throw new Error("Not authenticated");
  }

  const webId = sessionData.info.webId;
  const podRoot = getPodRoot(webId);
  const credentialUrl = `${podRoot}/products/${gtin}`;

  return readProductOwnership(credentialUrl);
}

/**
 * List all owned products from the Pod
 */
export async function listOwnedProducts(): Promise<ProductOwnership[]> {
  const sessionData = await getSolidNodeSession();

  if (!sessionData || !sessionData.info.webId) {
    throw new Error("Not authenticated");
  }

  if (!sessionData.fetch) {
    throw new Error("Session does not have authenticated fetch - tokens may be missing");
  }

  const webId = sessionData.info.webId;
  const podRoot = getPodRoot(webId);
  const containerUrl = `${podRoot}/products/`;

  console.log("Listing products from:", containerUrl);

  try {
    // Get the container dataset
    const containerDataset = await getSolidDataset(containerUrl, {
      fetch: sessionData.fetch,
    });

    // Get all contained resource URLs
    const resourceUrls = getContainedResourceUrlAll(containerDataset);

    // Read each product credential
    const products: ProductOwnership[] = [];
    for (const resourceUrl of resourceUrls) {
      try {
        const product = await readProductOwnership(resourceUrl);
        products.push(product);
      } catch (error) {
        // Skip invalid credentials
        console.error(`Failed to read product at ${resourceUrl}:`, error);
      }
    }

    return products;
  } catch (error) {
    // Container doesn't exist yet, return empty array
    if ((error as Error).message.includes("404")) {
      return [];
    }
    throw error;
  }
}
