"use client";

import { siteConfig } from "@/config/site";
import { useWallet } from "@/hooks/useWallet";
import Link from "next/link";
import { SiteHeaderConnectButton } from "./site-header-connect-button";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const { connected } = useWallet();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block text-foreground font-bold">
              {siteConfig.emoji}{" "}
              <span className="hidden md:inline-block">{siteConfig.name}</span>
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-8">
          <SiteHeaderConnectButton />
          <Link
            href={`/explore`}
            className="hidden md:block text-sm font-medium text-muted-foreground"
          >
            Marketplace
          </Link>
          {connected && (
            <Link
              href={`/farm`}
              className="hidden md:block text-sm font-medium text-muted-foreground"
            >
              My Farm
            </Link>
          )}
          {connected && (
            <Link
              href={`/investments`}
              className="hidden md:block text-sm font-medium text-muted-foreground"
            >
              My Investments
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
