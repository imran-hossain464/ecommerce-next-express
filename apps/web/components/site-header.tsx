"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, ShieldCheck, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuthTokenCookie, notifyAuthChanged } from "@/lib/client-auth";

const baseLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
  { href: "/orders/status", label: "Order Status" }
];

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function syncAuthState() {
      setIsLoggedIn(Boolean(getAuthTokenCookie()));
    }

    syncAuthState();
    window.addEventListener("app-auth-changed", syncAuthState);
    window.addEventListener("focus", syncAuthState);

    return () => {
      window.removeEventListener("app-auth-changed", syncAuthState);
      window.removeEventListener("focus", syncAuthState);
    };
  }, []);

  useEffect(() => {
    setIsLoggedIn(Boolean(getAuthTokenCookie()));
    setMenuOpen(false);
  }, [pathname]);

  const links = isLoggedIn ? baseLinks : [...baseLinks, { href: "/login", label: "Login" }];

  function logout() {
    document.cookie = "app-auth-token=; path=/; max-age=0; SameSite=Lax";
    setIsLoggedIn(false);
    setMenuOpen(false);
    notifyAuthChanged();
    router.push("/shop");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-orange-200/80 bg-white/90 shadow-sm backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/shop" className="inline-flex items-center gap-2 text-lg font-black tracking-normal text-orange-600">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-orange-600 text-sm text-white shadow-sm shadow-orange-200">N</span>
          <span>ToolBoxBD<span className="text-foreground">.</span></span>
        </Link>
        <nav className="hidden items-center rounded-full border border-orange-100 bg-orange-50/70 p-1 text-sm font-semibold text-muted-foreground md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 transition-colors ${
                pathname === link.href ? "bg-white text-orange-700 shadow-sm" : "hover:text-orange-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <>
              <Button asChild variant="ghost" size="icon" aria-label="My account">
                <Link href="/account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" aria-label="Admin panel">
                <Link href="/admin">
                  <ShieldCheck className="h-5 w-5" />
                </Link>
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      {menuOpen ? (
        <div className="border-t border-orange-200 bg-white md:hidden">
          <nav className="container grid gap-2 py-4 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground ${
                  pathname === link.href ? "bg-orange-50 text-orange-700" : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <button
                type="button"
                className="rounded-md px-2 py-2 text-left text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={logout}
              >
                Logout
              </button>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
