import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(req: Request) {
  let user: any;
  try {
    user = getUser(req);
  } catch {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { id: user.userId },
    include: { role: true, subscription: true }
  });

  return Response.json(me);
}
