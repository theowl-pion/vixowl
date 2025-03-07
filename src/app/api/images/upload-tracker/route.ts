import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { FREE_PLAN_IMAGE_LIMIT } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

const prisma = new PrismaClient();

// Helper function to authenticate the user
async function authenticateUser(req: NextRequest) {
  // Get the authorization header
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, userId: null, userEmail: null };
  }

  // Extract the token
  const token = authHeader.split(" ")[1];

  // Verify the token
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { authenticated: false, userId: null, userEmail: null };
  }

  return {
    authenticated: true,
    userId: data.user.id,
    userEmail: data.user.email,
    user: data.user,
  };
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const { authenticated, userId, userEmail } = await authenticateUser(req);

    if (!authenticated || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // If user doesn't exist in our database yet, create them
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: userEmail || "user@example.com", // Use the email from Supabase if available
          imagesUploaded: 1, // Start with 1 since this is their first upload
          subscriptionStatus: "free",
        },
      });

      return NextResponse.json({
        imagesUploaded: 1,
        remainingImages: FREE_PLAN_IMAGE_LIMIT - 1,
        canUpload: true,
      });
    }

    // Check if user is on free plan and has reached the limit
    if (
      user.subscriptionStatus !== "active" &&
      user.imagesUploaded >= FREE_PLAN_IMAGE_LIMIT
    ) {
      return NextResponse.json({
        imagesUploaded: user.imagesUploaded,
        remainingImages: 0,
        canUpload: false,
        message:
          "You've reached your free plan limit. Please upgrade to continue uploading images.",
      });
    }

    // Increment the imagesUploaded count
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        imagesUploaded: user.imagesUploaded + 1,
      },
    });

    // Calculate remaining images for free plan users
    const remainingImages =
      user.subscriptionStatus !== "active"
        ? Math.max(0, FREE_PLAN_IMAGE_LIMIT - updatedUser.imagesUploaded)
        : null; // null for premium users since they have unlimited uploads

    return NextResponse.json({
      imagesUploaded: updatedUser.imagesUploaded,
      remainingImages,
      canUpload: true,
    });
  } catch (error: any) {
    console.error("Error tracking image upload:", error);
    return NextResponse.json(
      { error: "Failed to track image upload", details: error.message },
      { status: 500 }
    );
  }
}
