"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/status-badge";
import { API_URL } from "@/lib/api";
import { getAuthTokenCookie } from "@/lib/client-auth";
import { formatCurrency } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

export function AdminOrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");

  const filteredOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return orders;

    return orders.filter((order) =>
      [
        order.customer_name,
        order.customer_email,
        order.shipping_address ?? "",
        order.status,
        String(order.total)
      ].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [orders, query]);

  useEffect(() => {
    setToken(getAuthTokenCookie());
  }, []);

  async function updateStatus(orderId: string, status: OrderStatus) {
    const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      setMessages((current) => ({ ...current, [orderId]: "Failed. Please login as admin again." }));
      return;
    }

    const updated = await response.json();
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, status: updated.status } : order))
    );
    setMessages((current) => ({ ...current, [orderId]: "Updated" }));
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle>Orders</CardTitle>
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search orders..."
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">{filteredOrders.length} of {orders.length} orders shown</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-64">Customer</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Update status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <p className="font-medium">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                </TableCell>
                <TableCell className="min-w-80 max-w-xl">
                  <p className="text-sm text-muted-foreground">{order.shipping_address ?? "-"}</p>
                </TableCell>
                <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  <StatusSelect
                    currentStatus={order.status}
                    onUpdate={(status) => updateStatus(order.id, status)}
                    message={messages[order.id]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StatusSelect({
  currentStatus,
  onUpdate,
  message
}: {
  currentStatus: OrderStatus;
  onUpdate: (status: OrderStatus) => void;
  message?: string;
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  return (
    <div className="flex min-w-56 flex-col gap-2">
      <div className="flex gap-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus)}
          className="h-10 flex-1 rounded-md border bg-white px-3 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Button type="button" onClick={() => onUpdate(status)}>Update</Button>
      </div>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
