"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/api";
import { getAuthTokenCookie } from "@/lib/client-auth";
import type { ProductStatus } from "@/lib/types";

export function AdminProductStatusActions({
  productId,
  currentStatus
}: {
  productId: string;
  currentStatus: ProductStatus;
}) {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<ProductStatus>(currentStatus);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setToken(getAuthTokenCookie());
  }, []);

  async function updateProductStatus() {
    const response = await fetch(`${API_URL}/admin/products/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    setMessage(response.ok ? "Updated" : "Failed");
  }

  return (
    <div className="flex min-w-64 flex-col gap-2">
      <Input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Admin token" />
      <div className="flex gap-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as ProductStatus)}
          className="h-10 flex-1 rounded-md border bg-background px-3 text-sm"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <Button type="button" onClick={updateProductStatus}>Save</Button>
      </div>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
