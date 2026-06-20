import { cookies } from "next/headers";
import { AdminOrdersTable } from "@/components/admin-orders-table";
import { getAdminOrders } from "@/lib/api";

export default async function AdminOrdersPage() {
  const cookieStore = await cookies();
  const orders = await getAdminOrders(cookieStore.get("app-auth-token")?.value);

  return <AdminOrdersTable initialOrders={orders} />;
}
