"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "crop-count.onboarding.dismissed";

export function OnboardingGuide() {
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    setIsHidden(dismissed === "1");
  }, []);

  if (isHidden) {
    return null;
  }

  return (
    <section className="w-full max-w-[920px] rounded-xl border bg-muted/30 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Quick start</h3>
          <p className="text-sm text-muted-foreground">
            Complete these steps to launch or back your first farm asset.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setIsHidden(true);
            window.localStorage.setItem(STORAGE_KEY, "1");
          }}
        >
          Dismiss
        </Button>
      </div>

      <ol className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
        <li className="rounded border bg-background p-3">
          <p className="font-medium">1. Connect wallet</p>
          <p className="text-muted-foreground mt-1">Use Freighter or enter your Stellar public key.</p>
        </li>
        <li className="rounded border bg-background p-3">
          <p className="font-medium">2. Explore opportunities</p>
          <p className="text-muted-foreground mt-1">Filter by type, pricing, and return expectations.</p>
          <Link href="/explore" className="inline-block mt-2 underline-offset-4 hover:underline">
            Open marketplace
          </Link>
        </li>
        <li className="rounded border bg-background p-3">
          <p className="font-medium">3. Track performance</p>
          <p className="text-muted-foreground mt-1">Monitor realized payouts and ROI in your dashboard.</p>
          <Link
            href="/investments"
            className="inline-block mt-2 underline-offset-4 hover:underline"
          >
            View investments
          </Link>
        </li>
      </ol>
    </section>
  );
}
