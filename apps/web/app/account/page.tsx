import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Home, Package, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/status-badge";
import { getAccountOrders, getProfile } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("app-auth-token")?.value;

  if (!token) redirect("/login");

  const [profile, orders] = await Promise.all([
    getProfile(token),
    getAccountOrders(token)
  ]);
  const latestAddress = orders[0]?.shipping_address;

  return (
    <section className="section">
      <div className="container grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5" /> My profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{profile.full_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{profile.phone ?? "-"}</p>
            </div>
            <div className="rounded-md border bg-orange-50 p-3">
              <p className="flex items-center gap-2 text-muted-foreground"><Home className="h-4 w-4" /> Address</p>
              <p className="mt-1 font-medium">{latestAddress ?? "No saved order address yet."}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Order history</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet. Orders placed after login will appear here.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {new Intl.DateTimeFormat("en-BD", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        }).format(new Date(order.created_at))}
                      </TableCell>
                      <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                      <TableCell>
                        {(order.order_items ?? []).map((item) => (
                          <p key={item.id} className="text-sm text-muted-foreground">
                            {item.product_name} x {item.quantity}
                          </p>
                        ))}
                      </TableCell>
                      <TableCell className="max-w-xs text-sm text-muted-foreground">{order.shipping_address ?? "-"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
