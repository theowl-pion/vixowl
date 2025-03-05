import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the image ID from the route parameter
    const imageId = params.id;

    console.log(
      "🔍 GET /api/images/check/[id] - Checking if image exists:",
      imageId
    );

    const { userId } = getAuth(req);
    if (!userId) {
      console.error("❌ GET /api/images/check/[id] - Unauthorized: No user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("✅ GET /api/images/check/[id] - User authenticated:", userId);

    if (!imageId) {
      console.error("❌ GET /api/images/check/[id] - Missing image ID");
      return NextResponse.json(
        { error: "Image ID is required", exists: false },
        { status: 400 }
      );
    }

    // Find the image to verify it exists and belongs to the user
    console.log("🔍 GET /api/images/check/[id] - Finding image:", imageId);
    const existingImage = await db.image.findUnique({
      where: { id: imageId },
    });

    if (!existingImage) {
      console.log("❌ GET /api/images/check/[id] - Image not found:", imageId);
      return NextResponse.json({ exists: false });
    }

    // Check if the image belongs to the user
    if (existingImage.userId !== userId) {
      console.log(
        "⚠️ GET /api/images/check/[id] - Image belongs to different user"
      );
      // For security reasons, we don't reveal that the image exists but belongs to another user
      return NextResponse.json({ exists: false });
    }

    console.log(
      "✅ GET /api/images/check/[id] - Image exists and belongs to user"
    );
    return NextResponse.json({ exists: true });
  } catch (error) {
    console.error("❌ GET /api/images/check/[id] - Error:", error);
    return NextResponse.json(
      { error: "Failed to check image", exists: false },
      { status: 500 }
    );
  }
}
