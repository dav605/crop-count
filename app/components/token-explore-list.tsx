"use client";

import { useWallet } from "@/hooks/useWallet";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import EntityList from "./entity-list";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "./ui/use-toast";
import { FarmAsset } from "@/types/farm-asset";
import useError from "@/hooks/useError";

function AssetCard(props: {
  asset: FarmAsset;
  accountAddress?: string;
  onUpdated: () => Promise<void>;
}) {
  const { handleError } = useError();
  const [units, setUnits] = useState("1");
  const [distributionAmount, setDistributionAmount] = useState("0");
  const [isLoading, setIsLoading] = useState(false);

  const isOwner =
    props.accountAddress?.toLowerCase() === props.asset.creator.toLowerCase();

  async function invest() {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/assets/${props.asset.assetId}/investments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            investor: props.accountAddress,
            units,
          }),
        }
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Investment failed");
      }

      toast({ title: "Investment submitted" });
      await props.onUpdated();
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)), true);
    } finally {
      setIsLoading(false);
    }
  }

  async function distribute() {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/assets/${props.asset.assetId}/distributions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operator: props.accountAddress,
            totalAmount: distributionAmount,
          }),
        }
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Distribution failed");
      }

      toast({ title: "Profit distribution recorded" });
      await props.onUpdated();
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)), true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full flex flex-col gap-4 border rounded px-5 py-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg">
            {props.asset.category} · {props.asset.kind}
          </h3>
          <p className="text-sm text-muted-foreground">{props.asset.description}</p>
          <p className="text-xs text-muted-foreground">ID: {props.asset.identifier}</p>
        </div>
        <div className="text-right text-sm">
          <p>Total units: {props.asset.unitsTotal}</p>
          <p>Available: {props.asset.unitsAvailable}</p>
          <p>Unit price: {props.asset.unitPrice}</p>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Expected return: {props.asset.expectedReturnAmount} in {props.asset.expectedReturnPeriod}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" asChild>
          <Link href={`/creators/${props.asset.creator}`}>Creator profile</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/explore/${props.asset.assetId}`}>View details</Link>
        </Button>
      </div>

      {!isOwner && BigInt(props.asset.unitsAvailable) > BigInt(0) && props.accountAddress && (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            value={units}
            onChange={(event) => setUnits(event.target.value)}
            className="max-w-28"
            disabled={isLoading}
          />
          <Button onClick={invest} disabled={isLoading}>
            Invest Units
          </Button>
        </div>
      )}

      {isOwner && (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={distributionAmount}
            onChange={(event) => setDistributionAmount(event.target.value)}
            className="max-w-40"
            disabled={isLoading}
          />
          <Button variant="secondary" onClick={distribute} disabled={isLoading}>
            Distribute Profit
          </Button>
        </div>
      )}
    </div>
  );
}

export function TokenExploreList() {
  const { account } = useWallet();
  const [assets, setAssets] = useState<FarmAsset[] | undefined>();
  const [kindFilter, setKindFilter] = useState<"all" | "crop" | "livestock">("all");
  const [sort, setSort] = useState<
    "newest" | "price-asc" | "price-desc" | "expected-return-desc" | "units-available-desc"
  >("newest");
  const [minUnitPrice, setMinUnitPrice] = useState("");
  const [maxUnitPrice, setMaxUnitPrice] = useState("");

  const openAssets = useMemo(
    () =>
      assets?.filter((asset) => {
        const available = BigInt(asset.unitsAvailable);
        return available > BigInt(0);
      }),
    [assets]
  );

  const loadAssets = useCallback(async () => {
    const query = new URLSearchParams();
    if (kindFilter !== "all") {
      query.set("kind", kindFilter);
    }
    if (minUnitPrice.trim()) {
      query.set("minUnitPrice", minUnitPrice.trim());
    }
    if (maxUnitPrice.trim()) {
      query.set("maxUnitPrice", maxUnitPrice.trim());
    }
    query.set("sort", sort);

    const response = await fetch(`/api/assets?${query.toString()}`, {
      cache: "no-store",
    });
    const payload = await response.json();
    setAssets(payload.assets || []);
  }, [kindFilter, maxUnitPrice, minUnitPrice, sort]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-4">
        <Select
          value={kindFilter}
          onValueChange={(value) =>
            setKindFilter(value as "all" | "crop" | "livestock")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Kind" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All kinds</SelectItem>
            <SelectItem value="crop">Crop</SelectItem>
            <SelectItem value="livestock">Livestock</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(value) =>
            setSort(
              value as
                | "newest"
                | "price-asc"
                | "price-desc"
                | "expected-return-desc"
                | "units-available-desc"
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price low to high</SelectItem>
            <SelectItem value="price-desc">Price high to low</SelectItem>
            <SelectItem value="expected-return-desc">Highest expected return</SelectItem>
            <SelectItem value="units-available-desc">Most units available</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="number"
          min={0}
          placeholder="Min unit price"
          value={minUnitPrice}
          onChange={(event) => setMinUnitPrice(event.target.value)}
        />

        <Input
          type="number"
          min={0}
          placeholder="Max unit price"
          value={maxUnitPrice}
          onChange={(event) => setMaxUnitPrice(event.target.value)}
        />
      </div>

      <EntityList
        entities={openAssets}
        renderEntityCard={(asset, index) => (
          <AssetCard
            key={index}
            asset={asset}
            accountAddress={account?.address}
            onUpdated={loadAssets}
          />
        )}
        noEntitiesText="No open assets right now"
        className="gap-6"
      />
    </div>
  );
}
