import { Badge } from "@/components/ui/badge";
import type { OrderStatus, ProductStatus } from "@/lib/types";

const orderColors: Record<OrderStatus, string> = {
  pending: "border-transparent bg-amber-100 text-amber-800",
  paid: "border-transparent bg-sky-100 text-sky-800",
  processing: "border-transparent bg-orange-100 text-orange-800",
  shipped: "border-transparent bg-indigo-100 text-indigo-800",
  delivered: "border-transparent bg-emerald-100 text-emerald-800",
  cancelled: "border-transparent bg-rose-100 text-rose-800"
};

const productColors: Record<ProductStatus, string> = {
  draft: "border-transparent bg-slate-100 text-slate-700",
  active: "border-transparent bg-emerald-100 text-emerald-800",
  archived: "border-transparent bg-zinc-200 text-zinc-700"
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge className={orderColors[status]}>{status}</Badge>;
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return <Badge className={productColors[status]}>{status}</Badge>;
}
