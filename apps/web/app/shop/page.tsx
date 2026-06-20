import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShopCatalog } from "@/components/shop-catalog";
import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ArrowRight, PackageCheck, Sparkles, Truck } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  let products: Product[] = [];
  let error = "";

  try {
    products = await getProducts();
  } catch {
    error = "Could not load products from the API. Make sure the Express server is running and NEXT_PUBLIC_API_URL points to it.";
  }

  return (
    <section className="section">
      <div className="container">
        <div className="mb-10 overflow-hidden rounded-lg border border-orange-200 bg-white shadow-xl shadow-orange-100/60">
          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-orange-200/60 blur-3xl" />
            <div className="relative">
              <Badge variant="secondary" className="border border-orange-200 bg-orange-50 text-orange-700">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                Fresh collection
              </Badge>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-normal text-orange-700 sm:text-5xl lg:text-6xl">
                Shop everyday favorites with a warmer touch.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Browse active products from your live Supabase catalog, add to cart, and checkout as a guest or logged-in customer.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <a href="#products">
                    Browse products
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/orders/status">Track order</Link>
                </Button>
              </div>
            </div>
            <div className="relative grid content-end gap-3 rounded-lg bg-orange-50 p-5">
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Available now</p>
                <p className="mt-1 text-3xl font-extrabold text-orange-700">{products.length}</p>
                <p className="text-sm font-medium">active products</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm">
                  <Truck className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-semibold">Fast local delivery</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm">
                  <PackageCheck className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-semibold">Guest checkout ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>
        ) : products.length === 0 ? (
          <div className="rounded-md border p-8 text-center text-muted-foreground">
            No active products found. In admin, set product status to active and make sure inventory is greater than 0.
          </div>
        ) : (
          <ShopCatalog products={products} />
        )}
      </div>
    </section>
  );
}
