"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Minus, Plus, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  function addToCart() {
    addItem(product, quantity);
    router.push("/cart");
  }

  return (
    <div>
      <Button asChild variant="ghost" className="mb-6 w-fit px-0 text-orange-700 hover:bg-transparent hover:text-orange-800">
        <Link href="/shop"><ArrowLeft className="h-4 w-4" /> Back to shop</Link>
      </Button>
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-orange-200 bg-white shadow-xl shadow-orange-100">
            <Image
              src={product.image_url ?? "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=900&q=80"}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 52vw, 100vw"
              priority
            />
            <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-orange-700 shadow-sm">
              Featured product
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, title: "Fast delivery", text: "Inside Bangladesh" },
              { icon: ShieldCheck, title: "Secure order", text: "Protected checkout" },
              { icon: CheckCircle2, title: "Quality checked", text: "Ready to ship" }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="border-orange-200 bg-white">
                  <CardContent className="flex gap-3 p-4">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-orange-100 text-orange-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.text}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        <Card className="h-fit border-orange-200 bg-white">
          <CardContent className="p-6 sm:p-8">
            <Badge variant={product.inventory > 0 ? "success" : "warning"} className="w-fit">
              {product.inventory > 0 ? `${product.inventory} in stock` : "Out of stock"}
            </Badge>
            <h1 className="mt-4 text-3xl font-extrabold tracking-normal text-orange-700 sm:text-5xl">{product.name}</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">{product.description}</p>
            <div className="mt-6 rounded-lg bg-orange-50 p-5">
              <p className="text-sm font-medium text-orange-700">Price</p>
              <p className="mt-1 text-4xl font-extrabold text-foreground">{formatCurrency(product.price)}</p>
            </div>
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">Quantity</p>
              <div className="inline-flex items-center rounded-md border border-orange-200 bg-white">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((value) => Math.min(product.inventory, value + 1))}
                  aria-label="Increase quantity"
                  disabled={product.inventory === 0 || quantity >= product.inventory}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Button size="lg" onClick={addToCart} disabled={product.inventory === 0}>
                <ShoppingCart className="h-4 w-4" />
                Add to cart
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/cart">View cart</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Orders can be tracked by phone number after checkout.
            </p>
          </CardContent>
        </Card>
        </div>
    </div>
  );
}
