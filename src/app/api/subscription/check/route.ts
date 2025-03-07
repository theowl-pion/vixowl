import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify the token
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = data.user.id;
    console.log("User ID:", userId);

    // Get user from database
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      console.log("User from DB:", user ? JSON.stringify(user) : "Not found");

      if (!user) {
        return NextResponse.json(
          {
            error: "User not found in database",
            userId: userId,
            supabaseUser: data.user,
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        userId: user.id,
        email: user.email,
        stripeCustomerId: user.stripeCustomerId,
        subscriptionId: user.subscriptionId,
        subscriptionStatus: user.subscriptionStatus,
        imagesUploaded: user.imagesUploaded,
        subscriptionPeriodEnd: user.subscriptionPeriodEnd,
      });
    } catch (dbError: any) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database error", message: dbError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error checking subscription:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
