import { cookies } from "next/headers";
import { AdminProductForm } from "@/components/admin-product-form";
import { AdminProductsTable } from "@/components/admin-products-table";
import { getAdminProducts } from "@/lib/api";

export default async function AdminProductsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("app-auth-token")?.value;
  const products = await getAdminProducts(token);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
      <AdminProductsTable initialProducts={products} />
      <AdminProductForm />
    </div>
  );
}
