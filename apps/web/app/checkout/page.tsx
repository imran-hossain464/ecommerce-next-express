"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { API_URL } from "@/lib/api";
import { getAuthTokenCookie } from "@/lib/client-auth";
import { formatCurrency } from "@/lib/format";
import type { Profile } from "@/lib/types";

type PlacedOrder = {
  id: string;
  customer_phone: string | null;
  total: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  useEffect(() => {
    const authToken = getAuthTokenCookie();
    setToken(authToken);

    if (!authToken) return;

    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((user) => setProfile(user))
      .catch(() => setProfile(null));
  }, []);

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (items.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        customer_name: profile?.full_name ?? String(form.get("customer_name")),
        customer_email: profile?.email ?? String(form.get("customer_email")),
        customer_phone: String(form.get("customer_phone") || profile?.phone || ""),
        shipping_address: String(form.get("shipping_address")),
        items: items.map((item) => ({ product_id: item.id, quantity: item.quantity }))
      })
    });

    if (!response.ok) {
      setMessage("Could not place order. Make sure products are loaded from your Supabase database.");
      return;
    }

    const order = await response.json();
    clearCart();
    setPlacedOrder(order);
  }

  return (
    <section className="section">
      <div className="container grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent>
            {!token ? (
              <div className="mb-5 rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
                You can checkout as a guest. <Link href="/login" className="font-medium text-foreground underline">Login</Link> or{" "}
                <Link href="/register" className="font-medium text-foreground underline">register</Link> if you want this order saved in your account history.
              </div>
            ) : null}
            <form className="grid gap-4" onSubmit={placeOrder}>
              <Input name="customer_name" placeholder="Full name" defaultValue={profile?.full_name ?? ""} required />
              <Input name="customer_email" type="email" placeholder="Email address" defaultValue={profile?.email ?? ""} required />
              <Input name="customer_phone" placeholder="Phone number" defaultValue={profile?.phone ?? ""} required />
              <Textarea name="shipping_address" placeholder="Shipping address" required />
              <Button type="submit">Place order</Button>
              {message ? <p className="text-sm text-destructive">{message}</p> : null}
            </form>
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-sm">
                <span>{item.name} x {item.quantity}</span>
                <span>{formatCurrency(Number(item.price) * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-3 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      {placedOrder ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Order placed successfully</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Thank you. Your order has been created and is now pending processing.
              </p>
              <div className="rounded-md border p-4 text-sm">
                <p><span className="font-medium">Order ID:</span> {placedOrder.id}</p>
                <p><span className="font-medium">Phone:</span> {placedOrder.customer_phone}</p>
                <p><span className="font-medium">Total:</span> {formatCurrency(placedOrder.total)}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  onClick={() => router.push(`/orders/status?phone=${encodeURIComponent(placedOrder.customer_phone ?? "")}`)}
                >
                  Track by phone
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/shop")}>
                  Continue shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </section>
  );
}
