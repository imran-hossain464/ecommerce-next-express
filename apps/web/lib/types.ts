export type ProductStatus = "draft" | "active" | "archived";
export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string | null;
  inventory: number;
  status: ProductStatus;
  created_at?: string;
};

export type CartItem = Product & {
  quantity: number;
};

export type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  shipping_address?: string;
  total: number;
  status: OrderStatus;
  created_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
};

export type Customer = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: "customer" | "admin";
  created_at: string;
};

export type Profile = Customer;
