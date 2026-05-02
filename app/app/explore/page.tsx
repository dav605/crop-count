"use client";

import { TokenExploreList } from "@/components/token-explore-list";
import { Separator } from "@/components/ui/separator";

export default function ExplorePage() {
  return (
    <div className="container py-10 lg:px-80">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Marketplace</h2>
        <p className="text-muted-foreground">
          Invest in fractionalized crop and livestock opportunities
        </p>
      </div>
      <Separator className="my-6" />
      <div className="w-full flex flex-col gap-6">
        <TokenExploreList />
      </div>
    </div>
  );
}
