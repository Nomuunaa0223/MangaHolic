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

  const { mangaId, title, content, order } = await req.json();
  if (!mangaId || !title || !content || order === undefined) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const chapter = await prisma.chapter.create({
    data: {
      mangaId,
      title,
      content,
      order: Number(order),
      isPreview: false,
    },
  });

  return Response.json(chapter);
}
