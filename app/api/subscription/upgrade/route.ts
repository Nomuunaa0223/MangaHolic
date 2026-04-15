import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  let user;
  try {
    user = getUser(req);
  } catch {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { subscription: true },
    });

    if (!dbUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (dbUser.subscription?.plan === "PREMIUM") {
      return Response.json({ error: "You are already on PREMIUM" }, { status: 400 });
    }

    const stripe = getStripe();
    const origin = new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/subscription?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription?canceled=1`,
      customer_email: dbUser.email,
      client_reference_id: String(dbUser.id),
      metadata: {
        userId: String(dbUser.id),
        plan: "PREMIUM",
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: 499,
            product_data: {
              name: "Manga Premium",
              description: "Unlock full chapter access",
            },
          },
        },
      ],
    });

    if (!session.url) {
      return Response.json({ error: "Stripe checkout URL was not created" }, { status: 500 });
    }

    return Response.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start Stripe checkout";
    return Response.json({ error: message }, { status: 500 });
  }
}
