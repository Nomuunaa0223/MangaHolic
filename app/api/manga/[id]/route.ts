import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { parseId } from "@/lib/ids";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    getUser(req);
  } catch {
    // нэвтрээгүй ч manga харагдана
  }
  const { id } = await params;
  const mangaId = parseId(id);
  const manga = await prisma.manga.findUnique({
    where: { id: mangaId },
    include: {
      chapters: {
        orderBy: { order: "asc" },
      },
    },
  });

  return Response.json(manga);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let user: any;
  try {
    user = getUser(req);
  } catch {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const mangaId = parseId(id);
  const { title } = await req.json();
  if (!title) {
    return Response.json({ error: "Missing title" }, { status: 400 });
  }

  const updated = await prisma.manga.update({
    where: { id: mangaId },
    data: { title },
  });

  return Response.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let user: any;
  try {
    user = getUser(req);
  } catch {
    return Response.json({ error: "Login required" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const mangaId = parseId(id);
  await prisma.chapter.deleteMany({
    where: { mangaId },
  });
  await prisma.manga.delete({
    where: { id: mangaId },
  });

  return Response.json({ ok: true });
}
