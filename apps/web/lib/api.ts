import type { Customer, Order, Product, Profile } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const demoProducts: Product[] = [
  {
    id: "demo-tee",
    name: "Everyday Cotton Tee",
    slug: "everyday-cotton-tee",
    description: "Soft cotton tee for daily wear.",
    price: 29,
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    inventory: 40,
    status: "active"
  },
  {
    id: "demo-bag",
    name: "Canvas Weekender Bag",
    slug: "canvas-weekender-bag",
    description: "Durable carryall with roomy compartments.",
    price: 89,
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    inventory: 18,
    status: "active"
  },
  {
    id: "demo-lamp",
    name: "Minimal Desk Lamp",
    slug: "minimal-desk-lamp",
    description: "Warm dimmable task lighting for focused work.",
    price: 64,
    image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    inventory: 25,
    status: "active"
  }
];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    cache: init?.cache ?? "no-store"
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getProducts() {
  return request<Product[]>("/products", { cache: "no-store" });
}

export async function getProduct(slug: string) {
  return request<Product>(`/products/${slug}`, { cache: "no-store" });
}

export async function getAdminProducts(token?: string) {
  if (!token) return demoProducts;
  return request<Product[]>("/admin/products", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store"
  });
}

export async function getAdminOrders(token?: string) {
  if (!token) {
    return [
      {
        id: "ORD-DEMO-1001",
        customer_name: "Ayesha Rahman",
        customer_email: "ayesha@example.com",
        total: 147,
        status: "processing",
        created_at: new Date().toISOString()
      }
    ] satisfies Order[];
  }

  return request<Order[]>("/admin/orders", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store"
  });
}

export async function getAdminCustomers(token?: string) {
  if (!token) {
    return [
      {
        id: "customer-demo",
        full_name: "Ayesha Rahman",
        email: "ayesha@example.com",
        phone: "+880 1700 000000",
        role: "customer",
        created_at: new Date().toISOString()
      }
    ] satisfies Customer[];
  }

  return request<Customer[]>("/admin/customers", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store"
  });
}

export async function getProfile(token: string) {
  return request<Profile>("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store"
  });
}

export async function getAccountOrders(token: string) {
  return request<Order[]>("/account/orders", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store"
  });
}

export { API_URL };
