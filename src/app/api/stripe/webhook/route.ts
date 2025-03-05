import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature");

  if (!signature) {
    return new NextResponse("Webhook Error: No Stripe-Signature header", {
      status: 400,
    });
  }

  // Check if Stripe is initialized
  if (!stripe) {
    return new NextResponse("Stripe is not initialized", { status: 500 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      // Payment is successful and the subscription is created
      if (session.mode === "subscription") {
        try {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription
          );

          // Find user by userId in metadata or by stripeCustomerId
          let user = await prisma.user.findUnique({
            where: { id: session.metadata.userId },
          });

          if (!user) {
            // Try to find by customer ID as fallback
            user = await prisma.user.findFirst({
              where: { stripeCustomerId: session.customer },
            });
          }

          if (user) {
            await prisma.user.update({
              where: {
                id: user.id,
              },
              data: {
                stripeCustomerId: session.customer,
                subscriptionId: subscription.id,
                subscriptionStatus: subscription.status,
                subscriptionPeriodEnd: new Date(
                  subscription.current_period_end * 1000
                ),
              },
            });
            console.log(
              `Updated user ${user.id} with subscription ${subscription.id}`
            );
          } else {
            console.error("No user found for checkout session:", session.id);
          }
        } catch (error) {
          console.error("Error processing checkout.session.completed:", error);
        }
      }
      break;

    case "invoice.payment_succeeded":
      // Continue the subscription
      try {
        if (session.billing_reason === "subscription_cycle") {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription
          );

          // Find user by subscriptionId or customer ID
          let user = await prisma.user.findFirst({
            where: { subscriptionId: subscription.id },
          });

          if (!user) {
            // Try to find by customer ID as fallback
            user = await prisma.user.findFirst({
              where: { stripeCustomerId: session.customer },
            });
          }

          if (user) {
            await prisma.user.update({
              where: {
                id: user.id,
              },
              data: {
                subscriptionStatus: subscription.status,
                subscriptionPeriodEnd: new Date(
                  subscription.current_period_end * 1000
                ),
              },
            });
            console.log(`Updated subscription for user ${user.id}`);
          } else {
            console.error("No user found for invoice:", session.id);
          }
        }
      } catch (error) {
        console.error("Error processing invoice.payment_succeeded:", error);
      }
      break;

    case "customer.subscription.updated":
      try {
        // Find user by subscriptionId or customer ID
        let updatedUser = await prisma.user.findFirst({
          where: { subscriptionId: session.id },
        });

        if (!updatedUser) {
          // Try to find by customer ID as fallback
          updatedUser = await prisma.user.findFirst({
            where: { stripeCustomerId: session.customer },
          });
        }

        if (updatedUser) {
          await prisma.user.update({
            where: {
              id: updatedUser.id,
            },
            data: {
              subscriptionStatus: session.status,
              subscriptionPeriodEnd: new Date(
                session.current_period_end * 1000
              ),
            },
          });
          console.log(
            `Updated subscription status for user ${updatedUser.id} to ${session.status}`
          );
        } else {
          console.error("No user found for subscription update:", session.id);
        }
      } catch (error) {
        console.error("Error processing customer.subscription.updated:", error);
      }
      break;

    case "customer.subscription.deleted":
      try {
        // Find user by subscriptionId or customer ID
        let deletedUser = await prisma.user.findFirst({
          where: { subscriptionId: session.id },
        });

        if (!deletedUser) {
          // Try to find by customer ID as fallback
          deletedUser = await prisma.user.findFirst({
            where: { stripeCustomerId: session.customer },
          });
        }

        if (deletedUser) {
          await prisma.user.update({
            where: {
              id: deletedUser.id,
            },
            data: {
              subscriptionStatus: "canceled",
              subscriptionId: null,
            },
          });
          console.log(
            `Marked subscription as canceled for user ${deletedUser.id}`
          );
        } else {
          console.error("No user found for subscription deletion:", session.id);
        }
      } catch (error) {
        console.error("Error processing customer.subscription.deleted:", error);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new NextResponse(null, { status: 200 });
}
