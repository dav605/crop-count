"use client";

import { useWallet } from "@/hooks/useWallet";
import { FarmAsset, Investment } from "@/types/farm-asset";
import EntityList from "./entity-list";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";

function calculateRealizedPayout(asset: FarmAsset | undefined, investorAddress: string): bigint {
  if (!asset) {
    return BigInt(0);
  }

  let total = BigInt(0);
  for (const distribution of asset.distributions) {
    for (const payout of distribution.payouts) {
      if (payout.investor.toLowerCase() === investorAddress.toLowerCase()) {
        total += BigInt(payout.amount);
      }
    }
  }

  return total;
}

export function TokenInvestmentsList() {
  const { account } = useWallet();
  const [items, setItems] = useState<
    { investment: Investment; asset?: FarmAsset }[] | undefined
  >();

  const summary = useMemo(() => {
    if (!items || !account?.address) {
      return null;
    }

    let totalPrincipal = BigInt(0);
    let totalRealized = BigInt(0);

    for (const item of items) {
      totalPrincipal += BigInt(item.investment.principalAmount);
      totalRealized += calculateRealizedPayout(item.asset, account.address);
    }

    const pnl = totalRealized - totalPrincipal;
    const roiBasisPoints =
      totalPrincipal > BigInt(0)
        ? Number((totalRealized * BigInt(10000)) / totalPrincipal)
        : 0;

    return {
      positions: items.length,
      totalPrincipal,
      totalRealized,
      pnl,
      roiPercent: (roiBasisPoints / 100).toFixed(2),
    };
  }, [account?.address, items]);

  useEffect(() => {
    if (!account?.address) {
      setItems([]);
      return;
    }

    Promise.all([
      fetch(`/api/investments?investor=${account.address}`, {
        cache: "no-store",
      }).then((response) => response.json()),
      fetch("/api/assets", { cache: "no-store" }).then((response) =>
        response.json()
      ),
    ])
      .then(([investmentsPayload, assetsPayload]) => {
        const assetsById = new Map<string, FarmAsset>();
        for (const asset of assetsPayload.assets || []) {
          assetsById.set(asset.assetId, asset);
        }

        setItems(
          (investmentsPayload.investments || []).map((investment: Investment) => ({
            investment,
            asset: assetsById.get(investment.assetId),
          }))
        );
      })
      .catch(() => setItems([]));
  }, [account?.address]);

  return (
    <div className="w-full flex flex-col gap-6">
      {summary && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded border p-3">
            <p className="text-xs text-muted-foreground">Positions</p>
            <p className="text-lg font-semibold">{summary.positions}</p>
          </div>
          <div className="rounded border p-3">
            <p className="text-xs text-muted-foreground">Principal</p>
            <p className="text-lg font-semibold">{summary.totalPrincipal.toString()}</p>
          </div>
          <div className="rounded border p-3">
            <p className="text-xs text-muted-foreground">Realized payouts</p>
            <p className="text-lg font-semibold">{summary.totalRealized.toString()}</p>
          </div>
          <div className="rounded border p-3">
            <p className="text-xs text-muted-foreground">PnL</p>
            <p
              className={`text-lg font-semibold ${
                summary.pnl < BigInt(0) ? "text-destructive" : "text-emerald-600"
              }`}
            >
              {summary.pnl.toString()}
            </p>
          </div>
          <div className="rounded border p-3">
            <p className="text-xs text-muted-foreground">Realized ROI</p>
            <p className="text-lg font-semibold">{summary.roiPercent}%</p>
          </div>
        </div>
      )}

      <EntityList
        entities={items}
        renderEntityCard={(item, index) => {
          const realized = calculateRealizedPayout(item.asset, account?.address || "");
          const principal = BigInt(item.investment.principalAmount);
          const roiBasisPoints =
            principal > BigInt(0)
              ? Number((realized * BigInt(10000)) / principal)
              : 0;

          return (
            <div key={index} className="w-full border rounded px-5 py-5">
              <p className="font-medium">
                {item.asset?.category || "Unknown asset"} · {item.asset?.kind || "n/a"}
              </p>
              <p className="text-sm text-muted-foreground">Asset ID: {item.investment.assetId}</p>
              <p className="text-sm text-muted-foreground">Units: {item.investment.units}</p>
              <p className="text-sm text-muted-foreground">
                Principal: {item.investment.principalAmount}
              </p>
              <p className="text-sm text-muted-foreground">
                Realized payouts: {realized.toString()} ({(roiBasisPoints / 100).toFixed(2)}%)
              </p>
              <p className="text-sm text-muted-foreground">
                Profit rounds: {item.asset?.distributions.length || 0}
              </p>
              <div className="mt-3">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/explore/${item.investment.assetId}`}>View detail</Link>
                </Button>
              </div>
            </div>
          );
        }}
        noEntitiesText="No investments for this wallet"
        className="gap-6"
      />
    </div>
  );
}
