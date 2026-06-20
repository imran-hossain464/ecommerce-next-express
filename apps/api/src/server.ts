import "dotenv/config";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { getJwtSecret, getUserFromRequest, requireAdmin, requireUser, type AuthedRequest } from "./auth.js";
import { uploadProductImage } from "./cloudinary.js";
import { validationMessage } from "./http.js";
import { supabase } from "./supabase.js";
import { loginSchema, orderSchema, orderStatusSchema, productSchema, registerSchema } from "./validation.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN ?? "https://ecommerce-next-express-qxm24p6ds.vercel.app", "http://localhost:3000" }));
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: validationMessage(parsed.error) });

  const password_hash = await bcrypt.hash(parsed.data.password, 12);

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      password_hash,
      role: "customer"
    })
    .select("id,full_name,email,phone,role,created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    return res.status(400).json({
      message: error.message,
      hint: "If this mentions auth.users, id, or password_hash, run supabase/fix-auth-schema.sql in Supabase SQL editor."
    });
  }

  const token = jwt.sign({ id: data.id }, getJwtSecret(), { expiresIn: "7d" });
  return res.status(201).json({ user: data, token });
});

app.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: validationMessage(parsed.error) });

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,full_name,email,phone,role,password_hash,created_at")
    .eq("email", parsed.data.email.toLowerCase())
    .single();

  if (error || !profile) return res.status(401).json({ message: "Invalid email or password" });

  const passwordMatches = await bcrypt.compare(parsed.data.password, profile.password_hash);
  if (!passwordMatches) return res.status(401).json({ message: "Invalid email or password" });

  const { password_hash, ...user } = profile;
  const token = jwt.sign({ id: profile.id }, getJwtSecret(), { expiresIn: "7d" });

  return res.json({ user, token });
});

app.get("/auth/me", requireUser, async (req: AuthedRequest, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,email,phone,role,created_at")
    .eq("id", req.user?.id)
    .single();

  if (error) return res.status(404).json({ message: "User not found" });
  return res.json(data);
});

app.get("/products", async (_req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  return res.json(data);
});

app.get("/products/:slug", async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", req.params.slug)
    .eq("status", "active")
    .single();

  if (error) return res.status(404).json({ message: "Product not found" });
  return res.json(data);
});

app.post("/orders", async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: validationMessage(parsed.error) });
  const authUser = await getUserFromRequest(req);

  const ids = parsed.data.items.map((item) => item.product_id);
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id,name,price,inventory,status")
    .in("id", ids);

  if (productError) return res.status(500).json({ message: productError.message });

  const productMap = new Map(products?.map((product) => [product.id, product]) ?? []);
  const orderItems = [];

  for (const item of parsed.data.items) {
    const product = productMap.get(item.product_id);
    if (!product || product.status !== "active" || product.inventory < item.quantity) {
      return res.status(400).json({ message: `Product ${item.product_id} is unavailable` });
    }

    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      quantity: item.quantity,
      unit_price: product.price
    });
  }

  const total = orderItems.reduce((sum, item) => sum + Number(item.unit_price) * item.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: authUser?.id ?? parsed.data.customer_id,
      customer_name: authUser?.full_name ?? parsed.data.customer_name,
      customer_email: authUser?.email ?? parsed.data.customer_email,
      customer_phone: authUser?.phone ?? parsed.data.customer_phone,
      shipping_address: parsed.data.shipping_address,
      total,
      status: "pending"
    })
    .select("*")
    .single();

  if (orderError) return res.status(500).json({ message: orderError.message });

  const { error: itemError } = await supabase
    .from("order_items")
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemError) return res.status(500).json({ message: itemError.message });

  return res.status(201).json(order);
});

app.get("/account/orders", requireUser, async (req: AuthedRequest, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("customer_id", req.user?.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  return res.json(data);
});

app.get("/orders/status/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("id,status,total,created_at,customer_email,customer_phone")
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(404).json({ message: "Order not found" });
  return res.json(data);
});

app.get("/orders/status/phone/:phone", async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("id,status,total,created_at,customer_email,customer_phone")
    .eq("customer_phone", req.params.phone)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  return res.json(data ?? []);
});

app.get("/admin/products", requireUser, requireAdmin, async (_req, res) => {
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ message: error.message });
  return res.json(data);
});

app.post("/admin/products", requireUser, requireAdmin, async (req, res) => {
  let body = req.body;

  if (req.body.image_data) {
    try {
      const uploaded = await uploadProductImage(req.body.image_data);
      body = {
        ...req.body,
        image_url: uploaded.secure_url
      };
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Image upload failed" });
    }
  }

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return res.status(400).json({ message: validationMessage(parsed.error) });

  const { data, error } = await supabase.from("products").insert(parsed.data).select("*").single();
  if (error) return res.status(500).json({ message: error.message });
  return res.status(201).json(data);
});

app.patch("/admin/products/:id", requireUser, requireAdmin, async (req, res) => {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: validationMessage(parsed.error) });

  const { data, error } = await supabase
    .from("products")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ message: error.message });
  return res.json(data);
});

app.get("/admin/customers", requireUser, requireAdmin, async (_req, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,email,phone,role,created_at")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  return res.json(data);
});

app.get("/admin/orders", requireUser, requireAdmin, async (_req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  return res.json(data);
});

app.patch("/admin/orders/:id/status", requireUser, requireAdmin, async (req, res) => {
  const parsed = orderStatusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: validationMessage(parsed.error) });

  const { data, error } = await supabase
    .from("orders")
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ message: error.message });
  return res.json(data);
});

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
