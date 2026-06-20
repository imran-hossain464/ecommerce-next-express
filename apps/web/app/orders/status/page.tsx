"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { OrderStatusBadge } from "@/components/status-badge";
import { Spinner } from "@/components/ui/spinner";
import type { OrderStatus } from "@/lib/types";

type StatusResult = {
  id: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  customer_email: string;
  customer_phone: string | null;
};

function OrderStatusContent() {
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState(searchParams.get("phone") ?? "");
  const [results, setResults] = useState<StatusResult[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResults([]);
    setLoading(true);

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setError("Enter the phone number used during checkout.");
      setLoading(false);
      return;
    }

    const response = await fetch(`${API_URL}/orders/status/phone/${encodeURIComponent(cleanPhone)}`);
    if (!response.ok) {
      setError("Could not look up orders. Check the phone number and try again.");
      setLoading(false);
      return;
    }

    const data = await response.json();
    if (data.length === 0) {
      setError("No orders found for this phone number.");
      setLoading(false);
      return;
    }

    setResults(data);
    setLoading(false);
  }

  return (
    <section className="section">
      <div className="container max-w-2xl">
        <h1 className="text-3xl font-bold tracking-normal">Order status</h1>
        <p className="mt-2 text-muted-foreground">Enter the phone number used during checkout to view order status.</p>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Track an order</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex gap-3" onSubmit={lookup}>
              <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" />
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : <Search className="h-4 w-4" />}
                {loading ? "Tracking..." : "Track"}
              </Button>
            </form>
            {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
            {results.length > 0 ? (
              <div className="mt-6 space-y-3">
                {results.map((result) => (
                  <div key={result.id} className="rounded-md border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold">
                        {new Intl.DateTimeFormat("en-BD", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        }).format(new Date(result.created_at))}
                      </p>
                      <OrderStatusBadge status={result.status} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Phone: {result.customer_phone}</p>
                    <p className="text-sm text-muted-foreground">Email: {result.customer_email}</p>
                    <p className="text-sm text-muted-foreground">Total: {formatCurrency(result.total)}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense fallback={null}>
      <OrderStatusContent />
    </Suspense>
  );
}
