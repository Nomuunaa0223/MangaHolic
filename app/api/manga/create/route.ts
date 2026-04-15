import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  let user: any;
  try {
    user = getUser(req);
  } catch {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title } = await req.json();
  if (!title) {
    return Response.json({ error: "Missing title" }, { status: 400 });
  }

  const manga = await prisma.manga.create({
    data: { title }
  });

  return Response.json(manga);
}
