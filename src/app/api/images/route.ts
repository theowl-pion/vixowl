import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PrismaClient } from "@prisma/client";
import { FREE_PLAN_IMAGE_LIMIT } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

const prisma = new PrismaClient();

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

export const GET = async (req: NextRequest) => {
  try {
    console.log("🔍 GET - Starting image fetch");

    // Authenticate the user
    const { authenticated, userId } = await authenticateUser(req);

    if (!authenticated || !userId) {
      console.error("❌ GET - Unauthorized: No user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ GET - User authenticated:", userId);

    console.log("🔍 GET - Fetching images for user:", userId);
    const images = await db.image.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    console.log("✅ GET - Found images:", images.length);

    return NextResponse.json(images);
  } catch (error) {
    console.error("❌ GET - Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch images", details: error },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    console.log("🔍 POST - Starting image upload");

    // Authenticate the user
    const { authenticated, userId, user } = await authenticateUser(req);

    if (!authenticated || !userId) {
      console.error("❌ POST - Unauthorized: No user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ POST - User authenticated:", userId);

    // Check if user has reached their free plan limit
    console.log("🔍 POST - Finding user in database");
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    // If user doesn't exist, create them
    if (!dbUser) {
      console.log("🔍 POST - User not found, creating new user");
      try {
        // First check if a user with this ID already exists
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [{ id: userId }, { email: user?.email }],
          },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              id: userId,
              email: user?.email || "user_" + userId + "@example.com", // Use user's email or a unique email based on userId
              imagesUploaded: 1,
              subscriptionStatus: "free",
            },
          });
          console.log("✅ POST - New user created");
        } else {
          console.log("⚠️ POST - User already exists, using existing user");
          // Update the existing user's image count
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { imagesUploaded: { increment: 1 } },
          });
        }
      } catch (createError) {
        console.error("❌ POST - Error creating user:", createError);
        // If we can't create the user, we'll still try to process the image
        // but we'll log the error
      }
    } else if (
      dbUser.subscriptionStatus !== "active" &&
      dbUser.imagesUploaded >= FREE_PLAN_IMAGE_LIMIT
    ) {
      // Important: We're checking imagesUploaded (total uploads) not current count
      // This ensures users can't delete images to upload more
      console.error("❌ POST - Free plan limit reached:", {
        imagesUploaded: dbUser.imagesUploaded,
        limit: FREE_PLAN_IMAGE_LIMIT,
      });
      return NextResponse.json(
        {
          error: "Free plan limit reached",
          message:
            "You've reached your free plan limit. Please upgrade to continue uploading images. Deleting images will not allow you to upload new ones.",
        },
        { status: 403 }
      );
    } else {
      // Increment the user's image count
      console.log("🔍 POST - Incrementing user's image count");
      await prisma.user.update({
        where: { id: userId },
        data: { imagesUploaded: { increment: 1 } },
      });
      console.log("✅ POST - User's image count incremented");
    }

    const body = await req.json();
    const { imageUrl, textMetadata } = body;

    if (!imageUrl) {
      console.error("❌ POST - No image data received");
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 }
      );
    }
    console.log("✅ POST - Image data received, length:", imageUrl.length);
    console.log(
      "🔍 POST - Text metadata received:",
      textMetadata ? "Yes" : "No"
    );

    console.log("🔍 POST - Creating image in database");
    const image = await db.image.create({
      data: {
        userId,
        src: imageUrl,
        textMetadata: textMetadata ? textMetadata : null,
      },
    });

    console.log("✅ POST - Image created successfully:", image.id);
    return NextResponse.json(image);
  } catch (err) {
    const error = err as Error;
    console.error("❌ POST - Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to save image" },
      { status: 500 }
    );
  }
};

export const PUT = async (req: NextRequest) => {
  try {
    console.log("🔍 PUT - Starting image update");

    // Authenticate the user
    const { authenticated, userId } = await authenticateUser(req);

    if (!authenticated || !userId) {
      console.error("❌ PUT - Unauthorized: No user ID");
      return NextResponse.json(
        { error: "Unauthorized", message: "User not authenticated" },
        { status: 401 }
      );
    }

    console.log("✅ PUT - User authenticated:", userId);

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("❌ PUT - Failed to parse request body:", parseError);
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "Could not parse request body",
        },
        { status: 400 }
      );
    }

    const { imageId, imageUrl, textMetadata } = body;

    console.log("🔍 PUT - Updating image:", {
      imageId,
      imageUrlLength: imageUrl?.length || 0,
      hasTextMetadata: !!textMetadata,
      bodyKeys: Object.keys(body),
    });

    if (!imageId) {
      console.error("❌ PUT - Missing image ID");
      return NextResponse.json(
        { error: "Bad request", message: "Image ID is required" },
        { status: 400 }
      );
    }

    if (!imageUrl || imageUrl.length < 1000) {
      console.error("❌ PUT - Invalid image data:", {
        length: imageUrl?.length || 0,
      });
      return NextResponse.json(
        { error: "Bad request", message: "Valid image data is required" },
        { status: 400 }
      );
    }

    // Find the image first to verify it exists and belongs to the user
    console.log("🔍 PUT - Finding existing image:", imageId);
    let existingImage;
    try {
      existingImage = await db.image.findUnique({
        where: { id: imageId },
      });
    } catch (dbError) {
      console.error("❌ PUT - Database error finding image:", dbError);
      return NextResponse.json(
        {
          error: "Database error",
          message: "Failed to find image in database",
        },
        { status: 500 }
      );
    }

    if (!existingImage) {
      console.error("❌ PUT - Image not found:", imageId);
      return NextResponse.json(
        {
          error: "Not found",
          message: `Image with ID ${imageId} not found`,
        },
        { status: 404 }
      );
    }
    console.log("✅ PUT - Found existing image:", existingImage.id);

    if (existingImage.userId !== userId) {
      console.error("❌ PUT - Unauthorized: Image belongs to different user", {
        imageUserId: existingImage.userId,
        requestUserId: userId,
      });
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You do not have permission to update this image",
        },
        { status: 403 }
      );
    }

    // Update the image
    console.log("🔍 PUT - Updating image in database");
    const updatedImage = await db.image.update({
      where: { id: imageId },
      data: {
        src: imageUrl,
        textMetadata: textMetadata || null,
      },
    });

    console.log("✅ PUT - Image updated successfully:", updatedImage.id);
    return NextResponse.json(updatedImage);
  } catch (error) {
    console.error("❌ PUT - Error:", error);
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
};
