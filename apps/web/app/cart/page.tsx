"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";

export default function CartPage() {
  const { items, total, removeItem, updateQuantity } = useCart();

  return (
    <section className="section">
      <div className="container grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Cart</h1>
          <div className="mt-6 space-y-4">
            {items.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">Your cart is empty.</CardContent>
              </Card>
            ) : (
              items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-md bg-muted sm:w-24">
                      <Image
                        src={item.image_url ?? "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=900&q=80"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-semibold">{item.name}</h2>
                      <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</p>
                    </div>
                    <Input
                      className="w-24"
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} aria-label="Remove item">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Shipping</span>
              <span>Calculated later</span>
            </div>
            <div className="flex justify-between border-t pt-4 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Button asChild className="w-full" aria-disabled={items.length === 0}>
              <Link href={items.length === 0 ? "/shop" : "/checkout"}>{items.length === 0 ? "Shop products" : "Checkout"}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
