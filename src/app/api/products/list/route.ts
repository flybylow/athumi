import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/solid/auth.server";
import { listOwnedProducts } from "@/lib/solid/pod";

/**
 * GET /api/products/list
 * List all product ownership credentials from the user's Pod
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

    // List products from Pod
    const products = await listOwnedProducts();

    // Convert Date objects to ISO strings for JSON response
    const productsWithDates = products.map((product) => ({
      ...product,
      issuedAt: product.issuedAt?.toISOString() || null,
    }));

    return NextResponse.json({
      success: true,
      products: productsWithDates,
      count: products.length,
    });
  } catch (error) {
    console.error("List products error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Full error:", error);
    
    return NextResponse.json(
      {
        error: "Failed to list product ownership credentials",
        message: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
