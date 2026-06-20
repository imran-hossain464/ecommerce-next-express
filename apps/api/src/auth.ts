import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "./supabase.js";

export type AuthedRequest = Request & {
  user?: {
    id: string;
    email?: string;
    role: "customer" | "admin";
  };
};

export async function requireUser(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Missing authorization token" });
  }

  let payload: { id: string };

  try {
    payload = jwt.verify(token, getJwtSecret()) as { id: string };
  } catch {
    return res.status(401).json({ message: "Invalid authorization token" });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,email")
    .eq("id", payload.id)
    .single();

  if (profileError || !profile) {
    return res.status(403).json({ message: "Profile not found" });
  }

  req.user = {
    id: payload.id,
    email: profile.email,
    role: profile.role
  };

  return next();
}

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return secret;
}

export async function getUserFromRequest(req: Request) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;

  try {
    const payload = jwt.verify(token, getJwtSecret()) as { id: string };
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id,full_name,email,phone,role")
      .eq("id", payload.id)
      .single();

    if (error || !profile) return null;
    return profile;
  } catch {
    return null;
  }
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  return next();
}
