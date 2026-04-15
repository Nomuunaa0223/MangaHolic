import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(req: Request) {
  let user;
  try {
    user = getUser(req);
  } catch {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: user.userId },
  });

  return Response.json(sub);
}
