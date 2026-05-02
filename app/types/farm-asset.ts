export type AssetKind = "crop" | "livestock";

export type Ownership = {
    investor: string;
    units: string;
};

export type DistributionPayout = {
    investor: string;
    amount: string;
};

export type ProfitDistribution = {
    distributionId: string;
    totalAmount: string;
    createdAtMs: string;
    payouts: DistributionPayout[];
};

export type FarmAsset = {
    assetId: string;
    creator: string;
    category: string;
    kind: AssetKind;
    description: string;
    identifier: string;
    unitsTotal: string;
    unitsAvailable: string;
    unitPrice: string;
    expectedReturnAmount: string;
    expectedReturnPeriod: string;
    metadataUri?: string;
    ownerships: Ownership[];
    distributions: ProfitDistribution[];
    createdAtMs: string;
};

export type Investment = {
    investmentId: string;
    assetId: string;
    investor: string;
    units: string;
    principalAmount: string;
    createdAtMs: string;
};
