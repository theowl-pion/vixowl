import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    console.log("🔍 GET /api/images/latest - Getting latest image");

    const { userId } = getAuth(req);
    if (!userId) {
      console.error("❌ GET /api/images/latest - Unauthorized: No user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("✅ GET /api/images/latest - User authenticated:", userId);

    // Find the latest image for the user
    console.log(
      "🔍 GET /api/images/latest - Finding latest image for user:",
      userId
    );
    const latestImage = await db.image.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true },
    });

    if (!latestImage) {
      console.log("⚠️ GET /api/images/latest - No images found for user");
      return NextResponse.json({ id: null });
    }

    console.log(
      "✅ GET /api/images/latest - Found latest image:",
      latestImage.id
    );
    return NextResponse.json({
      id: latestImage.id,
      createdAt: latestImage.createdAt,
    });
  } catch (error) {
    console.error("❌ GET /api/images/latest - Error:", error);
    return NextResponse.json(
      { error: "Failed to get latest image" },
      { status: 500 }
    );
  }
}
