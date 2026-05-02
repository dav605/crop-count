"use client";

import { FarmAsset } from "@/types/farm-asset";
import { useWallet } from "@/hooks/useWallet";
import { useEffect, useState } from "react";
import Link from "next/link";
import EntityList from "./entity-list";
import { Button } from "./ui/button";

function FarmAssetCard({ asset }: { asset: FarmAsset }) {
  return (
    <div className="w-full flex flex-col gap-2 border rounded px-5 py-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-lg">
          {asset.category} · {asset.kind}
        </h3>
        <span className="text-xs border rounded px-2 py-1 text-muted-foreground">
          {asset.unitsAvailable} units available
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{asset.description}</p>
      <div className="text-sm text-muted-foreground">
        Unit price: {asset.unitPrice} · Target return: {asset.expectedReturnAmount}
      </div>
      <div className="text-xs text-muted-foreground">
        Ownership records: {asset.ownerships.length} · Profit rounds: {asset.distributions.length}
      </div>
      <div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/explore/${asset.assetId}`}>View detail</Link>
        </Button>
      </div>
    </div>
  );
}

export function TokenFarmList() {
  const { account } = useWallet();
  const [assets, setAssets] = useState<FarmAsset[] | undefined>();

  useEffect(() => {
    if (!account?.address) {
      setAssets([]);
      return;
    }

    fetch(`/api/assets?creator=${account.address}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => setAssets(payload.assets || []))
      .catch(() => setAssets([]));
  }, [account?.address]);

  return (
    <EntityList
      entities={assets}
      renderEntityCard={(asset, index) => <FarmAssetCard key={index} asset={asset} />}
      noEntitiesText="No assets created by this wallet"
      className="gap-6"
    />
  );
}
