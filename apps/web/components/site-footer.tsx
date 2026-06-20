import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck, Truck } from "lucide-react";

const pageLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact us" },
  { href: "/cart", label: "Cart" },
  { href: "/account", label: "My account" },
  { href: "/orders/status", label: "Order status" }
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-orange-200 bg-white">
      <div className="container py-10">
        <div className="grid gap-8 rounded-lg bg-orange-50 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <Link href="/shop" className="inline-flex items-center gap-2 text-xl font-black tracking-normal text-orange-600">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-orange-600 text-sm text-white">N</span>
              ToolBoxBD<span className="text-foreground">.</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              A warm, modern ecommerce store powered by Next.js, Express, Supabase Postgres, and Cloudinary product images.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg bg-white p-3 text-sm font-semibold shadow-sm">
                <Truck className="h-5 w-5 text-orange-600" />
                Fast local delivery
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white p-3 text-sm font-semibold shadow-sm">
                <ShieldCheck className="h-5 w-5 text-orange-600" />
                Secure checkout
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-orange-700">Explore</h2>
            <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
              {pageLinks.map((link) => (
                <Link key={link.href} href={link.href} className="w-fit transition-colors hover:text-orange-700">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-orange-700">Contact</h2>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-orange-600" /> support@toolboxbd.com</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-orange-600" /> +880 1700 000000</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-orange-600" /> Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-orange-100 pt-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 ToolBoxBD. All rights reserved.</p>
          <p>Built for smooth shopping and easy order tracking.</p>
        </div>
      </div>
    </footer>
  );
}
