import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/solid/auth.server";
import {
  readProductOwnership,
  readProductOwnershipByGtin,
} from "@/lib/solid/pod";

/**
 * GET /api/products/read
 * Read a product ownership credential from the user's Pod
 * Query params: gtin (GTIN code) or url (full credential URL)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - not authenticated" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const gtin = searchParams.get("gtin");
    const url = searchParams.get("url");

    if (!gtin && !url) {
      return NextResponse.json(
        { error: "Missing required parameter: 'gtin' or 'url'" },
        { status: 400 }
      );
    }

    // Read from Pod
    let product;
    if (url) {
      product = await readProductOwnership(url);
    } else if (gtin) {
      product = await readProductOwnershipByGtin(gtin);
    } else {
      return NextResponse.json(
        { error: "Either 'gtin' or 'url' parameter is required" },
        { status: 400 }
      );
    }

    // Convert Date to ISO string for JSON response
    return NextResponse.json({
      success: true,
      product: {
        ...product,
        issuedAt: product.issuedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("Read product error:", error);
    
    // Handle not found errors
    if (
      error instanceof Error &&
      (error.message.includes("not found") || error.message.includes("404"))
    ) {
      return NextResponse.json(
        { error: "Product ownership credential not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to read product ownership credential",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
