// app/api/auth/register/route.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "Email already exists" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);

  let role = await prisma.role.findFirst({ where: { name: "USER" } });
  if (!role) {
    role = await prisma.role.create({ data: { name: "USER" } });
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: {
        connect: { id: role.id },
      },
      subscription: {
        create: { plan: "FREE" }
      }
    }
  });

  return Response.json(user);
}
