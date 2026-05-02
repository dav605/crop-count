import {
    createAsset,
    distributeProfit,
    investInAsset,
    listAssets,
    listEvents,
    listInvestments,
} from "@/lib/stellar/service";
import {
    AssetListFilter,
    BlockchainAdapter,
    CreateAssetInput,
    DistributeProfitInput,
    InvestmentListFilter,
    InvestInAssetInput,
} from "@/lib/blockchain/types";

export class StellarAdapter implements BlockchainAdapter {
    listAssets(filter?: AssetListFilter) {
        return listAssets(filter);
    }

    createAsset(input: CreateAssetInput) {
        return createAsset(input);
    }

    investInAsset(input: InvestInAssetInput) {
        return investInAsset(input);
    }

    distributeProfit(input: DistributeProfitInput) {
        return distributeProfit(input);
    }

    listInvestments(filter?: InvestmentListFilter) {
        return listInvestments(filter);
    }

    listEvents(limit = 100) {
        return listEvents(limit);
    }
}
