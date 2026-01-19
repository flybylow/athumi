import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/solid/auth.server";
import { writeProductOwnership } from "@/lib/solid/pod";
import type { ProductInput } from "@/lib/schemas/product-ownership";

/**
 * POST /api/products/write
 * Write a product ownership credential to the user's Pod
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - not authenticated" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { gtin, name, manufacturerId, manufacturerName, dppUrl } = body;

    // Validate required fields
    if (!gtin || !name || !manufacturerId || !manufacturerName || !dppUrl) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["gtin", "name", "manufacturerId", "manufacturerName", "dppUrl"],
        },
        { status: 400 }
      );
    }

    // Create product input
    const productInput: ProductInput = {
      gtin,
      name,
      manufacturerId,
      manufacturerName,
      dppUrl,
    };

    // Write to Pod
    const credentialUrl = await writeProductOwnership(productInput);

    return NextResponse.json({
      success: true,
      credentialUrl,
      message: "Product ownership credential saved successfully",
    });
  } catch (error) {
    console.error("Write product error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Full error:", error);
    
    return NextResponse.json(
      {
        error: "Failed to write product ownership credential",
        message: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
