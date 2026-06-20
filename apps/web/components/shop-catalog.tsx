"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/types";

export function ShopCatalog({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;

    return products.filter((product) =>
      [product.name, product.description, product.slug].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [products, query]);

  return (
    <div id="products">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">Catalog</p>
          <h2 className="text-2xl font-extrabold tracking-normal">Latest products</h2>
          <p className="mt-1 text-sm text-muted-foreground">{filteredProducts.length} of {products.length} products found</p>
        </div>
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            className="pl-9"
          />
        </div>
      </div>
      {filteredProducts.length === 0 ? (
        <div className="rounded-md border bg-white p-8 text-center text-muted-foreground">
          No products match your search.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
