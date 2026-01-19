/**
 * Product Ownership Credential Schema
 * 
 * Defines the structure for product ownership credentials stored in Solid Pods.
 * Uses Schema.org, GS1, and custom Tabulas vocabulary.
 */

// Vocabulary namespaces
export const TABULAS_NS = "https://tabulas.eu/vocab#";
export const GS1_NS = "https://gs1.org/voc/";
export const SCHEMA_NS = "https://schema.org/";

/**
 * Input data for creating a product ownership credential
 */
export interface ProductInput {
  gtin: string; // GTIN-13/14
  name: string; // Product name
  manufacturerId: string; // Manufacturer DID or identifier
  manufacturerName: string; // Manufacturer name
  dppUrl: string; // URL to Digital Product Passport record
}

/**
 * Product ownership credential as stored in Pod (RDF format)
 */
export interface ProductOwnershipCredential {
  "@context": {
    "@vocab": string;
    tabulas: string;
    gs1: string;
    schema: string;
  };
  "@type": "OwnershipCredential";
  "@id": string;
  
  // The product being owned
  product: {
    "@type": "Product";
    "@id": string; // GS1 Digital Link URI
    gtin: string; // GTIN-13/14
    name: string;
    manufacturer: {
      "@type": "Organization";
      "@id": string; // Manufacturer DID
      name: string;
    };
  };
  
  // Ownership details
  owner: {
    "@type": "Person";
    "@id": string; // Consumer WebID
  };
  
  // Provenance
  issuedAt: string; // ISO 8601 datetime
  issuedBy: {
    "@type": "Organization";
    "@id": string; // Tabulas DID
    name: "Tabulas";
  };
  
  // Source DPP
  dppSource: string; // URL to full DPP record
}

/**
 * Product ownership data as returned from API
 */
export interface ProductOwnership {
  url: string; // Credential URL in Pod
  gtin: string;
  name: string;
  manufacturerId: string | null;
  manufacturerName: string | null;
  owner: string | null; // WebID of owner
  issuedAt: Date | null;
  issuedBy: string | null;
  dppSource: string | null;
}
