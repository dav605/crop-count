"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FarmAsset } from "@/types/farm-asset";
import useMetadataLoader from "@/hooks/useMetadataLoader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function formatAddress(address: string): string {
  if (address.length <= 10) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function AssetDetailPage() {
  const params = useParams<{ assetId: string }>();
  const [asset, setAsset] = useState<FarmAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { data: metadata, isLoaded: isMetadataLoaded } = useMetadataLoader<Record<
    string,
    unknown
  >>(asset?.metadataUri);

  useEffect(() => {
    async function loadAsset() {
      setIsLoading(true);
      setLoadError(null);

      const response = await fetch(`/api/assets/${params.assetId}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setLoadError(payload?.error || "Failed to load asset");
        setAsset(null);
        setIsLoading(false);
        return;
      }

      const payload = await response.json();
      setAsset(payload.asset || null);
      setIsLoading(false);
    }

    loadAsset();
  }, [params.assetId]);

  const stats = useMemo(() => {
    if (!asset) {
      return null;
    }

    const totalUnits = BigInt(asset.unitsTotal);
    const availableUnits = BigInt(asset.unitsAvailable);
    const investedUnits = totalUnits - availableUnits;

    return {
      totalUnits: totalUnits.toString(),
      availableUnits: availableUnits.toString(),
      investedUnits: investedUnits.toString(),
      ownershipCount: asset.ownerships.length,
      distributionRounds: asset.distributions.length,
    };
  }, [asset]);

  return (
    <div className="container py-10 lg:px-60">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" asChild>
          <Link href="/explore" className="inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to marketplace
          </Link>
        </Button>
      </div>

      <Separator className="my-4" />

      {isLoading && <Skeleton className="h-48 w-full" />}

      {!isLoading && loadError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {loadError}
        </div>
      )}

      {!isLoading && !loadError && asset && stats && (
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border p-6">
            <h1 className="text-2xl font-semibold">
              {asset.category} · {asset.kind}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{asset.description}</p>
            <p className="mt-2 text-xs text-muted-foreground">Identifier: {asset.identifier}</p>

            <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
              <div className="rounded border p-3">
                <p className="text-xs text-muted-foreground">Unit price</p>
                <p className="text-base font-semibold">{asset.unitPrice}</p>
              </div>
              <div className="rounded border p-3">
                <p className="text-xs text-muted-foreground">Expected return</p>
                <p className="text-base font-semibold">
                  {asset.expectedReturnAmount} / {asset.expectedReturnPeriod}
                </p>
              </div>
              <div className="rounded border p-3">
                <p className="text-xs text-muted-foreground">Creator</p>
                <Link
                  href={`/creators/${asset.creator}`}
                  className="text-base font-semibold underline-offset-4 hover:underline"
                >
                  {formatAddress(asset.creator)}
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <div className="rounded border p-3">
              <p className="text-xs text-muted-foreground">Total units</p>
              <p className="text-lg font-semibold">{stats.totalUnits}</p>
            </div>
            <div className="rounded border p-3">
              <p className="text-xs text-muted-foreground">Available units</p>
              <p className="text-lg font-semibold">{stats.availableUnits}</p>
            </div>
            <div className="rounded border p-3">
              <p className="text-xs text-muted-foreground">Invested units</p>
              <p className="text-lg font-semibold">{stats.investedUnits}</p>
            </div>
            <div className="rounded border p-3">
              <p className="text-xs text-muted-foreground">Investors</p>
              <p className="text-lg font-semibold">{stats.ownershipCount}</p>
            </div>
            <div className="rounded border p-3">
              <p className="text-xs text-muted-foreground">Distribution rounds</p>
              <p className="text-lg font-semibold">{stats.distributionRounds}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h2 className="text-lg font-semibold">Ownership breakdown</h2>
              <div className="mt-4 flex flex-col gap-2">
                {asset.ownerships.length === 0 && (
                  <p className="text-sm text-muted-foreground">No investors yet.</p>
                )}

                {asset.ownerships.map((ownership) => (
                  <div
                    key={`${ownership.investor}-${ownership.units}`}
                    className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                  >
                    <span>{formatAddress(ownership.investor)}</span>
                    <span className="font-medium">{ownership.units} units</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h2 className="text-lg font-semibold">Distribution history</h2>
              <div className="mt-4 flex flex-col gap-2">
                {asset.distributions.length === 0 && (
                  <p className="text-sm text-muted-foreground">No profit distributions yet.</p>
                )}

                {asset.distributions.map((distribution) => (
                  <div
                    key={distribution.distributionId}
                    className="rounded border px-3 py-2 text-sm"
                  >
                    <p className="font-medium">Total: {distribution.totalAmount}</p>
                    <p className="text-xs text-muted-foreground">
                      Payouts: {distribution.payouts.length}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold">Metadata</h2>
            {!isMetadataLoaded && <Skeleton className="mt-3 h-20 w-full" />}
            {isMetadataLoaded && !metadata && (
              <p className="mt-2 text-sm text-muted-foreground">
                No metadata linked to this asset.
              </p>
            )}
            {isMetadataLoaded && metadata && (
              <pre className="mt-3 overflow-auto rounded bg-muted p-3 text-xs">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
