import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { parseId } from "@/lib/ids";

export async function POST(req: Request) {
  let user;
  try {
    user = getUser(req);
  } catch {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

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

    if (sessionUserId !== user.userId) {
      return Response.json({ error: "Session does not belong to this user" }, { status: 403 });
    }

    if (session.payment_status !== "paid") {
      return Response.json({ error: "Payment has not completed yet" }, { status: 400 });
    }

    const subscription = await prisma.subscription.upsert({
      where: { userId: user.userId },
      update: { plan: "PREMIUM" },
      create: {
        userId: user.userId,
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
