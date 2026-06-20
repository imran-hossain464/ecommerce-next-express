import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { getProduct } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product = null;

  try {
    product = await getProduct(slug);
  } catch {
    product = null;
  }

  if (!product) notFound();

  return (
    <section className="section">
      <div className="container">
        <ProductDetail product={product} />
      </div>
    </section>
  );
}
