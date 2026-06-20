"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCart } from "@/components/cart-provider";
import { formatCurrency } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();

  function addToCart() {
    addItem(product);
    router.push("/cart");
  }

  return (
    <Card className="group overflow-hidden border-orange-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100">
      <div className="relative aspect-[4/3] bg-orange-50">
        <Link href={`/shop/${product.slug}`} aria-label={`View ${product.name}`}>
          <Image
            src={product.image_url ?? "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=900&q=80"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </Link>
        <div className="absolute left-3 top-3">
          <Badge variant={product.inventory > 0 ? "success" : "warning"}>
            {product.inventory > 0 ? "In stock" : "Out of stock"}
          </Badge>
        </div>
      </div>
      <CardContent className="pt-5">
        <div className="space-y-3">
          <div>
            <Link href={`/shop/${product.slug}`} className="text-lg font-bold tracking-normal hover:text-orange-700">
              {product.name}
            </Link>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          </div>
          <p className="text-xl font-extrabold text-orange-700">{formatCurrency(product.price)}</p>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{product.inventory} available</p>
        <Button onClick={addToCart}>Add to cart</Button>
      </CardFooter>
    </Card>
  );
}
