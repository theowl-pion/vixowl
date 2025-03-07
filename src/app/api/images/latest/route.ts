import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";

// Helper function to authenticate the user
async function authenticateUser(req: NextRequest) {
  // Get the authorization header
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, userId: null };
  }

  // Extract the token
  const token = authHeader.split(" ")[1];

  // Verify the token
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { authenticated: false, userId: null };
  }

  return { authenticated: true, userId: data.user.id, user: data.user };
}

export async function GET(req: NextRequest) {
  try {
    console.log("🔍 GET /api/images/latest - Getting latest image");

    // Authenticate the user
    const { authenticated, userId } = await authenticateUser(req);
    if (!authenticated || !userId) {
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
