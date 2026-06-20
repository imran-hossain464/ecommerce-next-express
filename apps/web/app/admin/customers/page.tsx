import { cookies } from "next/headers";
import { AdminCustomersTable } from "@/components/admin-customers-table";
import { getAdminCustomers } from "@/lib/api";

export default async function AdminCustomersPage() {
  const cookieStore = await cookies();
  const customers = await getAdminCustomers(cookieStore.get("app-auth-token")?.value);

  return <AdminCustomersTable customers={customers} />;
}
