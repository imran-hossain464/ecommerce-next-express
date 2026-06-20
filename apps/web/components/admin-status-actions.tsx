"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/api";
import { getAuthTokenCookie } from "@/lib/client-auth";
import type { OrderStatus } from "@/lib/types";

export function AdminOrderStatusActions({ orderId }: { orderId: string }) {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<OrderStatus>("processing");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setToken(getAuthTokenCookie());
  }, []);

  async function updateStatus() {
    const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    setMessage(response.ok ? "Updated" : "Failed. Please login as admin again.");
  }

  return (
    <div className="flex min-w-72 flex-col gap-2">
      <Input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Admin token" />
      <div className="flex gap-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus)}
          className="h-10 flex-1 rounded-md border bg-background px-3 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Button type="button" onClick={updateStatus}>Update</Button>
      </div>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
