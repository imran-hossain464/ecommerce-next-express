import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().default(""),
  price: z.coerce.number().nonnegative(),
  image_url: z.string().url().optional().nullable(),
  inventory: z.coerce.number().int().nonnegative(),
  status: z.enum(["draft", "active", "archived"]).default("draft")
});

export const orderSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  customer_name: z.string().min(2),
  customer_email: z.string().email(),
  customer_phone: z.string().optional().nullable(),
  shipping_address: z.string().min(5),
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      quantity: z.coerce.number().int().positive()
    })
  ).min(1)
});

export const orderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled"])
});

export const registerSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  password: z.string().min(8)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
