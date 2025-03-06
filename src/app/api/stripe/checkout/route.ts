import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      console.error("Unauthorized: No user ID found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

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

    // Get or create user in our database
    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      // Get user email from request body
      const body = await req.json().catch(() => ({}));
      const email = body.email || "user@example.com";

      console.log("Creating new user in database:", userId, email);

      dbUser = await prisma.user.create({
        data: {
          id: userId,
          email: email,
        },
      });
    }

    // Get or create Stripe customer
    let customerId = dbUser.stripeCustomerId;

    if (!customerId) {
      console.log("Creating new Stripe customer for user:", userId);

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
    const session = await stripe.checkout.sessions.create({
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

    console.log("Checkout session created:", session.id);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
