import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { parseId } from "@/lib/ids";

export async function POST(req: Request) {
  let sessionId = "";

  try {
    const body = await req.json();
    sessionId = body?.sessionId ?? "";
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!sessionId) {
    return Response.json({ error: "Missing sessionId" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const sessionUserId = parseId(
      session.client_reference_id || session.metadata?.userId || ""
    );

    if (session.payment_status !== "paid") {
      return Response.json({ error: "Payment has not completed yet" }, { status: 400 });
    }

    const subscription = await prisma.subscription.upsert({
      where: { userId: sessionUserId },
      update: { plan: "PREMIUM" },
      create: {
        userId: sessionUserId,
        plan: "PREMIUM",
      },
    });

    return Response.json({ subscription });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to verify Stripe session";
    return Response.json({ error: message }, { status: 500 });
  }
}
