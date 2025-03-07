import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PrismaClient } from "@prisma/client";
import { supabase } from "@/lib/supabase";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log("Stripe checkout API called");

    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Unauthorized: No authorization header");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify the token
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      console.error("Unauthorized: Invalid token");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = data.user.id;
    const userEmail = data.user.email;
    console.log("User authenticated:", userId);

    // Check if Stripe is initialized
    if (!stripe) {
      console.error(
        "Stripe is not initialized. Check STRIPE_SECRET_KEY environment variable."
      );
      return new NextResponse("Stripe is not initialized", { status: 500 });
    }

    // Check if STRIPE_PRICE_ID is set
    if (!process.env.STRIPE_PRICE_ID) {
      console.error("STRIPE_PRICE_ID is not set in environment variables");
      return new NextResponse("Stripe price ID is not configured", {
        status: 500,
      });
    }

    console.log("Processing checkout for user:", userId);
    console.log("STRIPE_PRICE_ID:", process.env.STRIPE_PRICE_ID);

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("Request body:", body);
    } catch (error) {
      console.error("Error parsing request body:", error);
      body = {};
    }

    // Get or create user in our database
    let dbUser;
    try {
      dbUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      console.log("Database user found:", !!dbUser);
    } catch (error) {
      console.error("Error finding user in database:", error);
      return new NextResponse("Database error", { status: 500 });
    }

    if (!dbUser) {
      // Get user email from session
      const email = userEmail || body.email || "user@example.com";

      console.log("Creating new user in database:", userId, email);

      try {
        dbUser = await prisma.user.create({
          data: {
            id: userId,
            email: email,
          },
        });
        console.log("User created in database:", dbUser.id);
      } catch (error) {
        console.error("Error creating user in database:", error);
        return new NextResponse("Database error", { status: 500 });
      }
    }

    // Get or create Stripe customer
    let customerId = dbUser.stripeCustomerId;

    if (!customerId) {
      console.log("Creating new Stripe customer for user:", userId);

      try {
        // Create a new customer in Stripe
        const customer = await stripe.customers.create({
          email: dbUser.email,
          metadata: {
            userId: dbUser.id,
          },
        });

        customerId = customer.id;

        console.log("Created Stripe customer:", customerId);

        // Update user with Stripe customer ID
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customerId },
        });
      } catch (error) {
        console.error("Error creating Stripe customer:", error);
        return new NextResponse("Stripe customer creation failed", {
          status: 500,
        });
      }
    }

    const successUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "https://vixowl.com"
    }/home?success=true`;

    const cancelUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "https://vixowl.com"
    }/home?canceled=true`;

    console.log("Creating checkout session with:", {
      customerId,
      priceId: process.env.STRIPE_PRICE_ID,
      successUrl,
      cancelUrl,
    });

    // Create a checkout session
    let checkoutSession;
    try {
      checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
        },
        customer: customerId, // Use the customer ID instead of email
      });

      console.log("Checkout session created:", checkoutSession.id);
    } catch (error) {
      console.error("Error creating Stripe checkout session:", error);
      return new NextResponse("Stripe checkout session creation failed", {
        status: 500,
      });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Unhandled error in checkout API:", error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
