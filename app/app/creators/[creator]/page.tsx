"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FarmAsset } from "@/types/farm-asset";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function shortAddress(value: string): string {
  if (value.length <= 12) {
    return value;
  }
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export default function CreatorProfilePage() {
  const params = useParams<{ creator: string }>();
  const [assets, setAssets] = useState<FarmAsset[] | undefined>();

  useEffect(() => {
    fetch(`/api/assets?creator=${encodeURIComponent(params.creator)}`, {
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((payload) => setAssets(payload.assets || []))
      .catch(() => setAssets([]));
  }, [params.creator]);

  const stats = useMemo(() => {
    if (!assets) {
      return null;
    }

    let listedUnits = BigInt(0);
    let investedUnits = BigInt(0);
    let totalCapital = BigInt(0);

    for (const asset of assets) {
      const total = BigInt(asset.unitsTotal);
      const available = BigInt(asset.unitsAvailable);
      listedUnits += total;
      investedUnits += total - available;
      totalCapital += (total - available) * BigInt(asset.unitPrice);
    }

    return {
      assetCount: assets.length,
      listedUnits,
      investedUnits,
      totalCapital,
    };
  }, [assets]);

  return (
    <div className="container py-10 lg:px-60">
      <Button variant="ghost" asChild>
        <Link href="/explore" className="inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to marketplace
        </Link>
      </Button>

      <Separator className="my-4" />

      <div className="rounded-lg border p-6">
        <p className="text-xs text-muted-foreground">Creator profile</p>
        <h1 className="text-2xl font-semibold mt-1">{shortAddress(params.creator)}</h1>
        <p className="text-sm text-muted-foreground mt-2 break-all">{params.creator}</p>
      </div>

      <div className="mt-4">
        {!assets && <Skeleton className="h-24 w-full" />}

        {stats && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded border p-3">
              <p className="text-xs text-muted-foreground">Assets listed</p>
              <p className="text-lg font-semibold">{stats.assetCount}</p>
            </div>
            <div className="rounded border p-3">
              <p className="text-xs text-muted-foreground">Units listed</p>
              <p className="text-lg font-semibold">{stats.listedUnits.toString()}</p>
            </div>
            <div className="rounded border p-3">
              <p className="text-xs text-muted-foreground">Units sold</p>
              <p className="text-lg font-semibold">{stats.investedUnits.toString()}</p>
            </div>
            <div className="rounded border p-3">
              <p className="text-xs text-muted-foreground">Capital raised</p>
              <p className="text-lg font-semibold">{stats.totalCapital.toString()}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {(assets || []).length === 0 && (
          <div className="rounded border px-4 py-4 text-sm text-muted-foreground">
            This creator has not listed any assets yet.
          </div>
        )}

        {(assets || []).map((asset) => (
          <div key={asset.assetId} className="rounded border px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">
                {asset.category} · {asset.kind}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/explore/${asset.assetId}`}>View asset</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{asset.description}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Units available: {asset.unitsAvailable} / {asset.unitsTotal}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
