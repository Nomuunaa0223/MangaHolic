// lib/auth.ts
import jwt from "jsonwebtoken";

export type AuthUser = {
  userId: number;
  role: "USER" | "ADMIN";
  iat?: number;
  exp?: number;
};

export function getUser(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) throw new Error("No token");

  const token = auth.split(" ")[1];

  return jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
}
