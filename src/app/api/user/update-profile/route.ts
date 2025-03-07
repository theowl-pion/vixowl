import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

// Helper function to authenticate the user
async function authenticateUser(req: NextRequest) {
  // Get the authorization header
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, userId: null, token: null };
  }

  // Extract the token
  const token = authHeader.split(" ")[1];

  // Verify the token
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { authenticated: false, userId: null, token: null };
  }

  return {
    authenticated: true,
    userId: data.user.id,
    user: data.user,
    token,
  };
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const { authenticated, userId, user, token } = await authenticateUser(req);

    if (!authenticated || !userId || !token) {
      console.error(
        "❌ POST /api/user/update-profile - Unauthorized: No user ID or token"
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const body = await req.json();
    const { full_name } = body;

    if (!full_name) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    console.log(
      "🔍 POST /api/user/update-profile - Updating profile for user:",
      userId
    );

    // Create a Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Update user metadata using the admin client
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { user_metadata: { full_name } }
    );

    if (error) {
      console.error("❌ POST /api/user/update-profile - Error:", error);
      return NextResponse.json(
        { error: "Failed to update profile", details: error.message },
        { status: 500 }
      );
    }

    console.log(
      "✅ POST /api/user/update-profile - Profile updated successfully"
    );
    return NextResponse.json({ success: true, user: data.user });
  } catch (error: any) {
    console.error("❌ POST /api/user/update-profile - Error:", error);
    return NextResponse.json(
      { error: "Failed to update profile", details: error.message },
      { status: 500 }
    );
  }
}
