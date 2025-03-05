import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { FREE_PLAN_IMAGE_LIMIT } from "@/lib/stripe";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
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
          email: "user@example.com", // This will be updated later
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
