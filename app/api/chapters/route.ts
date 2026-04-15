import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(req: Request) {
  let user: any = null;
  try {
    user = getUser(req);
  } catch {
    // нэвтрээгүй — зөвхөн эхний бүлэг
  }

  const { searchParams } = new URL(req.url);
  const mangaId = searchParams.get("mangaId");
  const page = Number(searchParams.get("page") || 1);

  if (!mangaId) {
    return Response.json({ error: "Missing mangaId" }, { status: 400 });
  }

  const chapters = await prisma.chapter.findMany({
    where: { mangaId },
    orderBy: { order: "asc" },
    skip: (page - 1) * 10,
    take: 10,
  });

  // нэвтрээгүй эсвэл FREE хэрэглэгч — зөвхөн эхний бүлэг
  if (!user) {
    const first = chapters.length > 0 ? [chapters[0]] : [];
    return Response.json(first);
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    include: { subscription: true },
  });

  if (!dbUser) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  if (user.role === "ADMIN" || dbUser.subscription?.plan === "PREMIUM") {
    return Response.json(chapters);
  }

  const first = chapters.length > 0 ? [chapters[0]] : [];
  return Response.json(first);
}
