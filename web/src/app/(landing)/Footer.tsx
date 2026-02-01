"use client";

import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Updates", href: "/updates" },
    {
      label: "Chrome Extension",
      href: "https://chromewebstore.google.com/detail/recallai/dciecdpjkhhagindacahojeiaeecblaa",
      external: true,
    },
  ],
  legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-muted/30 dark:bg-transparent">
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logo.png"
                alt="Retenio"
                width={20}
                height={20}
                className="transition-transform group-hover:scale-110"
              />
              <span className="font-bold">Retenio</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              Transform video learning with AI-powered summaries and spaced repetition.
            </p>
            <a
              href="https://saasgrow.app?ref=retenio.ai"
              target="_blank"
              rel="noopener"
              className="inline-block transition-opacity hover:opacity-80"
            >
              <img
                src="https://saasgrow.app/api/badge?type=featured&style=dark"
                alt="Retenio on SaaSGrow"
                width={240}
                height={54}
                className="dark:block hidden"
              />
              <img
                src="https://saasgrow.app/api/badge?type=featured&style=light"
                alt="Retenio on SaaSGrow"
                width={240}
                height={54}
                className="dark:hidden block"
              />
            </a>
          </div>

          {/* Product links */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Retenio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
