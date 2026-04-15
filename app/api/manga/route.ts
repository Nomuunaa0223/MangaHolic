import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    getUser(req);
  } catch {
    // Public users can still load the manga list.
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);

    const data = await prisma.manga.findMany({
      skip: (page - 1) * 10,
      take: 10,
      include: {
        _count: {
          select: { chapters: true },
        },
      },
    });

    return Response.json(data);
  } catch (error) {
    console.error("Failed to load manga list", error);
    return Response.json([], { status: 200 });
  }
}
