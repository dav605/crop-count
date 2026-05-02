import { StellarAdapter } from "@/lib/blockchain/stellar-adapter";
import {
    AssetListFilter,
    CreateAssetInput,
    DistributeProfitInput,
    InvestmentListFilter,
    InvestInAssetInput,
} from "@/lib/blockchain/types";

const stellarAdapter = new StellarAdapter();

export async function listAssets(filter?: AssetListFilter) {
    return stellarAdapter.listAssets(filter);
}

export async function createAsset(input: CreateAssetInput) {
    return stellarAdapter.createAsset(input);
}

export async function investInAsset(input: InvestInAssetInput) {
    return stellarAdapter.investInAsset(input);
}

export async function distributeProfit(input: DistributeProfitInput) {
    return stellarAdapter.distributeProfit(input);
}

export async function listInvestments(filter?: InvestmentListFilter) {
    return stellarAdapter.listInvestments(filter);
}

export async function listEvents(limit = 100) {
    return stellarAdapter.listEvents(limit);
}
