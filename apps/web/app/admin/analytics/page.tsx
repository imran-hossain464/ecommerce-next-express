import { cookies } from "next/headers";
import { AdminAnalytics } from "@/components/admin-analytics";
import { getAdminOrders, getAdminProducts } from "@/lib/api";

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("app-auth-token")?.value;
  const [orders, products] = await Promise.all([
    getAdminOrders(token),
    getAdminProducts(token)
  ]);

  return <AdminAnalytics orders={orders} products={products} />;
}
