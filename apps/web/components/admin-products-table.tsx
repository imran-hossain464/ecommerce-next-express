"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductStatusBadge } from "@/components/status-badge";
import { API_URL } from "@/lib/api";
import { getAuthTokenCookie } from "@/lib/client-auth";
import { formatCurrency } from "@/lib/format";
import type { Product, ProductStatus } from "@/lib/types";

export function AdminProductsTable({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    setToken(getAuthTokenCookie());
  }, []);

  async function updateStatus(productId: string, status: ProductStatus) {
    const response = await fetch(`${API_URL}/admin/products/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      setMessages((current) => ({ ...current, [productId]: "Failed. Please login as admin again." }));
      return;
    }

    const updated = await response.json();
    setProducts((current) =>
      current.map((product) => (product.id === productId ? { ...product, status: updated.status } : product))
    );
    setMessages((current) => ({ ...current, [productId]: "Updated" }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-24">Stock</TableHead>
              <TableHead className="w-32 text-right">Price</TableHead>
              <TableHead className="w-64">Update status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell><ProductStatusBadge status={product.status} /></TableCell>
                <TableCell>{product.inventory}</TableCell>
                <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                <TableCell>
                  <ProductStatusSelect
                    currentStatus={product.status}
                    onUpdate={(status) => updateStatus(product.id, status)}
                    message={messages[product.id]}
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

function ProductStatusSelect({
  currentStatus,
  onUpdate,
  message
}: {
  currentStatus: ProductStatus;
  onUpdate: (status: ProductStatus) => void;
  message?: string;
}) {
  const [status, setStatus] = useState<ProductStatus>(currentStatus);

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as ProductStatus)}
          className="h-10 flex-1 rounded-md border bg-white px-3 text-sm"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <Button type="button" onClick={() => onUpdate(status)}>Save</Button>
      </div>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
