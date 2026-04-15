import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { parseId } from "@/lib/ids";

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return Response.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const payload = await req.text();
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userIdRaw = session.metadata?.userId || session.client_reference_id;

      if (userIdRaw && session.payment_status === "paid") {
        const userId = parseId(userIdRaw);
        await prisma.subscription.upsert({
          where: { userId },
          update: { plan: "PREMIUM" },
          create: {
            userId,
            plan: "PREMIUM",
          },
        });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stripe webhook verification failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
