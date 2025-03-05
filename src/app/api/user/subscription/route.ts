import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
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
          imagesUploaded: 0,
          subscriptionStatus: "free",
        },
      });
    }

    return NextResponse.json({
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPeriodEnd: user.subscriptionPeriodEnd,
      imagesUploaded: user.imagesUploaded,
    });
  } catch (error: any) {
    console.error("Error fetching subscription data:", error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
