// src/app/api/clerk/webhook/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const signature = request.headers.get("clerk-signature") || "";

  const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    const event = webhook.verify(JSON.stringify(payload), {
      "svix-signature": signature,
    }) as WebhookEvent;
    console.log("Clerk event received:", event);

    // Process the event as needed.
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 }
    );
  }
}
