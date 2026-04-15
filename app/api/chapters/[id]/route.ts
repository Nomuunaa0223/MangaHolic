import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { parseId } from "@/lib/ids";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let user: any;
  try {
    user = getUser(req);
  } catch {
    return Response.json({ error: "Login required" }, { status: 401 });
  }
  const { id } = await params;
  const chapterId = parseId(id);
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
  });

  if (!chapter) {
    return Response.json({ error: "Chapter not found" }, { status: 404 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    include: { subscription: true },
  });

  if (!dbUser) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  if (user.role === "ADMIN" || dbUser.subscription?.plan === "PREMIUM") {
    return Response.json(chapter);
  }

  const first = await prisma.chapter.findFirst({
    where: { mangaId: chapter.mangaId },
    orderBy: { order: "asc" },
  });

  if (first && first.id === chapterId) {
    return Response.json(chapter);
  }

  return Response.json({ error: "Upgrade required" }, { status: 403 });
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
  const chapterId = parseId(id);
  const { title, content, order } = await req.json();
  if (!title && content === undefined && order === undefined) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await prisma.chapter.findUnique({
    where: { id: chapterId },
  });

  if (!existing) {
    return Response.json({ error: "Chapter not found" }, { status: 404 });
  }

  const updated = await prisma.chapter.update({
    where: { id: chapterId },
    data: {
      title: title ?? existing.title,
      content: content ?? existing.content,
      order: order !== undefined ? Number(order) : existing.order,
      isPreview: false,
    },
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
  const chapterId = parseId(id);
  await prisma.chapter.delete({
    where: { id: chapterId },
  });

  return Response.json({ ok: true });
}
