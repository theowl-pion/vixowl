import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    // Get the image ID from the route parameter
    const imageId = params.imageId;

    console.log("🔍 GET /api/images/[imageId] - Fetching image:", imageId);

    const { userId } = getAuth(request);
    if (!userId) {
      console.error("❌ GET /api/images/[imageId] - Unauthorized: No user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the image
    const image = await db.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      console.error("❌ GET /api/images/[imageId] - Image not found:", imageId);
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Check if the image belongs to the user
    if (image.userId !== userId) {
      console.error(
        "❌ GET /api/images/[imageId] - Unauthorized: Image belongs to different user"
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    console.log("✅ GET /api/images/[imageId] - Image found:", {
      id: image.id,
      hasTextMetadata: !!image.textMetadata,
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error("❌ GET /api/images/[imageId] - Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const imageId = params.imageId;

    // Vérifier si l'image appartient à l'utilisateur
    const image = await db.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (image.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Supprimer l'image
    await db.image.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    console.log(
      "🔍 PUT /api/images/[imageId] - Starting image update:",
      params.imageId
    );

    const { userId } = getAuth(req);
    if (!userId) {
      console.error("❌ PUT /api/images/[imageId] - Unauthorized: No user ID");
      return NextResponse.json(
        { error: "Unauthorized", message: "User not authenticated" },
        { status: 401 }
      );
    }
    console.log("✅ PUT /api/images/[imageId] - User authenticated:", userId);

    const imageId = params.imageId;

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error(
        "❌ PUT /api/images/[imageId] - Failed to parse request body:",
        parseError
      );
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "Could not parse request body",
        },
        { status: 400 }
      );
    }

    const { imageUrl } = body;

    if (!imageUrl || imageUrl.length < 1000) {
      console.error("❌ PUT /api/images/[imageId] - Invalid image data:", {
        length: imageUrl?.length || 0,
      });
      return NextResponse.json(
        { error: "Bad request", message: "Valid image data is required" },
        { status: 400 }
      );
    }

    // Find the image first to verify it exists and belongs to the user
    console.log(
      "🔍 PUT /api/images/[imageId] - Finding existing image:",
      imageId
    );
    let existingImage;
    try {
      existingImage = await db.image.findUnique({
        where: { id: imageId },
      });
    } catch (dbError) {
      console.error(
        "❌ PUT /api/images/[imageId] - Database error finding image:",
        dbError
      );
      return NextResponse.json(
        {
          error: "Database error",
          message: "Failed to find image in database",
        },
        { status: 500 }
      );
    }

    if (!existingImage) {
      console.error("❌ PUT /api/images/[imageId] - Image not found:", imageId);
      return NextResponse.json(
        {
          error: "Not found",
          message: `Image with ID ${imageId} not found`,
        },
        { status: 404 }
      );
    }
    console.log(
      "✅ PUT /api/images/[imageId] - Found existing image:",
      existingImage.id
    );

    if (existingImage.userId !== userId) {
      console.error(
        "❌ PUT /api/images/[imageId] - Unauthorized: Image belongs to different user",
        {
          imageUserId: existingImage.userId,
          requestUserId: userId,
        }
      );
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "You are not authorized to update this image",
        },
        { status: 403 }
      );
    }
    console.log(
      "✅ PUT /api/images/[imageId] - User authorized to update image"
    );

    console.log("🔍 PUT /api/images/[imageId] - Updating image in database");
    try {
      const updatedImage = await db.image.update({
        where: { id: imageId },
        data: { src: imageUrl },
      });

      console.log(
        "✅ PUT /api/images/[imageId] - Image updated successfully:",
        updatedImage.id
      );
      return NextResponse.json(updatedImage);
    } catch (dbError) {
      console.error("❌ PUT /api/images/[imageId] - Database error:", dbError);
      return NextResponse.json(
        {
          error: "Database error",
          message: "Failed to update image in database",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ PUT /api/images/[imageId] - Error:", error);
    return NextResponse.json(
      {
        error: "Server error",
        message: "Failed to update image",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
