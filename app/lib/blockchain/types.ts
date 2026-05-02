import { AssetKind, FarmAsset, Investment, ProfitDistribution } from "@/types/farm-asset";

export type AssetSortOption =
    | "newest"
    | "price-asc"
    | "price-desc"
    | "expected-return-desc"
    | "units-available-desc";

export type AssetListFilter = {
    creator?: string;
    kind?: AssetKind;
    minUnitPrice?: string;
    maxUnitPrice?: string;
    sort?: AssetSortOption;
};

export type InvestmentListFilter = {
    investor?: string;
};

export type CreateAssetInput = {
    creator: string;
    category: string;
    kind: AssetKind;
    description: string;
    identifier: string;
    unitsTotal: string;
    unitPrice: string;
    expectedReturnAmount: string;
    expectedReturnPeriod: string;
    metadataUri?: string;
};

export type InvestInAssetInput = {
    assetId: string;
    investor: string;
    units: string;
};

export type DistributeProfitInput = {
    assetId: string;
    operator: string;
    totalAmount: string;
};

export type BlockchainEventRecord = {
    eventId: string;
    type: string;
    payload: Record<string, string>;
    createdAtMs: string;
};

export type BlockchainEvents = {
    local: BlockchainEventRecord[];
    onchain: unknown[];
};

export interface BlockchainAdapter {
    listAssets(filter?: AssetListFilter): Promise<FarmAsset[]>;
    createAsset(input: CreateAssetInput): Promise<FarmAsset>;
    investInAsset(input: InvestInAssetInput): Promise<Investment>;
    distributeProfit(input: DistributeProfitInput): Promise<ProfitDistribution>;
    listInvestments(filter?: InvestmentListFilter): Promise<Investment[]>;
    listEvents(limit?: number): Promise<BlockchainEvents>;
}
