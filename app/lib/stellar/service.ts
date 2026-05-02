import {
    AssetListFilter,
    BlockchainEvents,
    InvestmentListFilter,
} from "@/lib/blockchain/types";
import { FarmAsset, Investment, ProfitDistribution } from "@/types/farm-asset";

type MutableState = {
    assets: FarmAsset[];
    investments: Investment[];
    events: {
        eventId: string;
        type: string;
        payload: Record<string, string>;
        createdAtMs: string;
    }[];
    sequence: bigint;
};

declare global {
    // eslint-disable-next-line no-var
    var __cropCountStellarState: MutableState | undefined;
}

function getState(): MutableState {
    if (!globalThis.__cropCountStellarState) {
        globalThis.__cropCountStellarState = {
            assets: [],
            investments: [],
            events: [],
            sequence: BigInt(1),
        };
    }

    return globalThis.__cropCountStellarState;
}

function nextId(prefix: string): string {
    const state = getState();
    const value = state.sequence;
    state.sequence += BigInt(1);
    return `${prefix}-${value.toString()}`;
}

function nowMs(): string {
    return Date.now().toString();
}

function toBigInt(value: string): bigint {
    const normalized = value?.trim();
    if (!normalized || !/^\d+$/.test(normalized)) {
        throw new Error("Expected positive integer string");
    }
    return BigInt(normalized);
}

function tryToBigInt(value?: string): bigint | undefined {
    if (!value) {
        return undefined;
    }

    const normalized = value.trim();
    if (!normalized || !/^\d+$/.test(normalized)) {
        return undefined;
    }

    return BigInt(normalized);
}

function pushEvent(type: string, payload: Record<string, string>) {
    getState().events.unshift({
        eventId: nextId("event"),
        type,
        payload,
        createdAtMs: nowMs(),
    });
}

export async function listAssets(filter?: AssetListFilter): Promise<FarmAsset[]> {
    let assets = [...getState().assets];

    if (filter?.creator) {
        const creator = filter.creator.toLowerCase();
        assets = assets.filter((asset) => asset.creator.toLowerCase() === creator);
    }

    if (filter?.kind) {
        assets = assets.filter((asset) => asset.kind === filter.kind);
    }

    const minUnitPrice = tryToBigInt(filter?.minUnitPrice);
    if (minUnitPrice !== undefined) {
        assets = assets.filter((asset) => BigInt(asset.unitPrice) >= minUnitPrice);
    }

    const maxUnitPrice = tryToBigInt(filter?.maxUnitPrice);
    if (maxUnitPrice !== undefined) {
        assets = assets.filter((asset) => BigInt(asset.unitPrice) <= maxUnitPrice);
    }

    const sort = filter?.sort || "newest";
    assets.sort((left, right) => {
        switch (sort) {
            case "price-asc":
                return Number(BigInt(left.unitPrice) - BigInt(right.unitPrice));
            case "price-desc":
                return Number(BigInt(right.unitPrice) - BigInt(left.unitPrice));
            case "expected-return-desc":
                return Number(
                    BigInt(right.expectedReturnAmount) - BigInt(left.expectedReturnAmount)
                );
            case "units-available-desc":
                return Number(BigInt(right.unitsAvailable) - BigInt(left.unitsAvailable));
            case "newest":
            default:
                return Number(BigInt(right.createdAtMs) - BigInt(left.createdAtMs));
        }
    });

    return assets;
}

export async function createAsset(input: {
    creator: string;
    category: string;
    kind: "crop" | "livestock";
    description: string;
    identifier: string;
    unitsTotal: string;
    unitPrice: string;
    expectedReturnAmount: string;
    expectedReturnPeriod: string;
    metadataUri?: string;
}): Promise<FarmAsset> {
    const unitsTotal = toBigInt(input.unitsTotal);
    const unitPrice = toBigInt(input.unitPrice);
    const expectedReturnAmount = toBigInt(input.expectedReturnAmount);

    if (
        unitsTotal <= BigInt(0) ||
        unitPrice <= BigInt(0) ||
        expectedReturnAmount <= BigInt(0)
    ) {
        throw new Error("Numeric values must be positive integers");
    }

    const asset: FarmAsset = {
        assetId: nextId("asset"),
        creator: input.creator,
        category: input.category,
        kind: input.kind,
        description: input.description,
        identifier: input.identifier,
        unitsTotal: unitsTotal.toString(),
        unitsAvailable: unitsTotal.toString(),
        unitPrice: unitPrice.toString(),
        expectedReturnAmount: expectedReturnAmount.toString(),
        expectedReturnPeriod: input.expectedReturnPeriod,
        metadataUri: input.metadataUri,
        ownerships: [],
        distributions: [],
        createdAtMs: nowMs(),
    };

    getState().assets.unshift(asset);

    pushEvent("AssetCreated", {
        asset_id: asset.assetId,
        creator: asset.creator,
        units_total: asset.unitsTotal,
        unit_price: asset.unitPrice,
        chain: "stellar",
    });

    return asset;
}

export async function investInAsset(input: {
    assetId: string;
    investor: string;
    units: string;
}): Promise<Investment> {
    const state = getState();
    const asset = state.assets.find((item) => item.assetId === input.assetId);
    if (!asset) {
        throw new Error("Asset not found");
    }

    const units = toBigInt(input.units);
    const unitsAvailable = BigInt(asset.unitsAvailable);
    const unitPrice = BigInt(asset.unitPrice);

    if (units <= BigInt(0)) {
        throw new Error("Units must be greater than zero");
    }
    if (units > unitsAvailable) {
        throw new Error("Not enough units available");
    }

    const principal = units * unitPrice;

    asset.unitsAvailable = (unitsAvailable - units).toString();

    const ownership = asset.ownerships.find(
        (item) => item.investor.toLowerCase() === input.investor.toLowerCase()
    );
    if (ownership) {
        ownership.units = (BigInt(ownership.units) + units).toString();
    } else {
        asset.ownerships.push({
            investor: input.investor,
            units: units.toString(),
        });
    }

    const investment: Investment = {
        investmentId: nextId("investment"),
        assetId: asset.assetId,
        investor: input.investor,
        units: units.toString(),
        principalAmount: principal.toString(),
        createdAtMs: nowMs(),
    };

    state.investments.unshift(investment);

    pushEvent("InvestmentCreated", {
        asset_id: investment.assetId,
        investor: investment.investor,
        units: investment.units,
        principal_amount: investment.principalAmount,
        chain: "stellar",
    });

    return investment;
}

function deterministicPayouts(
    ownerships: { investor: string; units: string }[],
    totalAmount: bigint
): { investor: string; amount: string }[] {
    const ranked = [...ownerships].sort((left, right) =>
        left.investor.localeCompare(right.investor)
    );

    const totalUnits = ranked.reduce(
        (sum, item) => sum + BigInt(item.units),
        BigInt(0)
    );
    if (totalUnits <= BigInt(0)) {
        throw new Error("No ownership records for distribution");
    }

    let distributed = BigInt(0);
    const payouts = ranked.map((item) => {
        const amount = (totalAmount * BigInt(item.units)) / totalUnits;
        distributed += amount;
        return {
            investor: item.investor,
            amount,
        };
    });

    let remainder = totalAmount - distributed;
    let index = 0;
    while (remainder > BigInt(0) && payouts.length > 0) {
        payouts[index].amount += BigInt(1);
        remainder -= BigInt(1);
        index = (index + 1) % payouts.length;
    }

    return payouts.map((item) => ({
        investor: item.investor,
        amount: item.amount.toString(),
    }));
}

export async function distributeProfit(input: {
    assetId: string;
    operator: string;
    totalAmount: string;
}): Promise<ProfitDistribution> {
    const asset = getState().assets.find((item) => item.assetId === input.assetId);
    if (!asset) {
        throw new Error("Asset not found");
    }
    if (asset.creator.toLowerCase() !== input.operator.toLowerCase()) {
        throw new Error("Only asset creator can distribute profits");
    }

    const totalAmount = toBigInt(input.totalAmount);
    if (totalAmount <= BigInt(0)) {
        throw new Error("Distribution amount must be positive");
    }

    const payouts = deterministicPayouts(asset.ownerships, totalAmount);
    const distribution: ProfitDistribution = {
        distributionId: nextId("distribution"),
        totalAmount: totalAmount.toString(),
        createdAtMs: nowMs(),
        payouts,
    };

    asset.distributions.unshift(distribution);

    pushEvent("ProfitDistributed", {
        asset_id: asset.assetId,
        distribution_id: distribution.distributionId,
        total_amount: distribution.totalAmount,
        chain: "stellar",
    });

    return distribution;
}

export async function listInvestments(
    filter?: InvestmentListFilter
): Promise<Investment[]> {
    const investments = getState().investments;
    if (!filter?.investor) {
        return investments;
    }

    return investments.filter(
        (item) => item.investor.toLowerCase() === filter.investor!.toLowerCase()
    );
}

export async function listEvents(limit = 100): Promise<BlockchainEvents> {
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 100;

    return {
        local: getState().events.slice(0, safeLimit),
        onchain: [],
    };
}
