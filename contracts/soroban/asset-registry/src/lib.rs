#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

#[derive(Clone)]
#[contracttype]
pub enum AssetKind {
    Crop,
    Livestock,
}

#[derive(Clone)]
#[contracttype]
pub struct Ownership {
    pub investor: Address,
    pub units: u64,
}

#[derive(Clone)]
#[contracttype]
pub struct DistributionPayout {
    pub investor: Address,
    pub amount: u64,
}

#[derive(Clone)]
#[contracttype]
pub struct ProfitDistribution {
    pub distribution_id: u64,
    pub total_amount: u64,
    pub payouts: Vec<DistributionPayout>,
}

#[derive(Clone)]
#[contracttype]
pub struct FarmAsset {
    pub asset_id: u64,
    pub creator: Address,
    pub category: String,
    pub kind: AssetKind,
    pub description: String,
    pub identifier: String,
    pub units_total: u64,
    pub units_available: u64,
    pub unit_price: u64,
    pub expected_return_amount: u64,
    pub expected_return_period: String,
    pub metadata_uri: Option<String>,
    pub ownerships: Vec<Ownership>,
    pub distributions: Vec<ProfitDistribution>,
}

#[derive(Clone)]
#[contracttype]
pub struct Investment {
    pub investment_id: u64,
    pub asset_id: u64,
    pub investor: Address,
    pub units: u64,
    pub principal_amount: u64,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Sequence,
    Assets,
    Investments,
}

#[contract]
pub struct AssetRegistryContract;

fn next_id(env: &Env) -> u64 {
    let key = DataKey::Sequence;
    let current = env.storage().persistent().get::<DataKey, u64>(&key).unwrap_or(1);
    env.storage().persistent().set(&key, &(current + 1));
    current
}

fn read_assets(env: &Env) -> Vec<FarmAsset> {
    env.storage()
        .persistent()
        .get::<DataKey, Vec<FarmAsset>>(&DataKey::Assets)
        .unwrap_or(Vec::new(env))
}

fn write_assets(env: &Env, assets: &Vec<FarmAsset>) {
    env.storage().persistent().set(&DataKey::Assets, assets);
}

fn read_investments(env: &Env) -> Vec<Investment> {
    env.storage()
        .persistent()
        .get::<DataKey, Vec<Investment>>(&DataKey::Investments)
        .unwrap_or(Vec::new(env))
}

fn write_investments(env: &Env, investments: &Vec<Investment>) {
    env.storage().persistent().set(&DataKey::Investments, investments);
}

fn deterministic_payouts(
    env: &Env,
    ownerships: &Vec<Ownership>,
    total_amount: u64,
) -> Vec<DistributionPayout> {
    let mut total_units = 0u64;
    for i in 0..ownerships.len() {
        total_units += ownerships.get(i).unwrap().units;
    }

    if total_units == 0 {
        panic!("No ownership records for distribution");
    }

    let mut payouts = Vec::<DistributionPayout>::new(env);
    let mut distributed = 0u64;

    for i in 0..ownerships.len() {
        let ownership = ownerships.get(i).unwrap();
        let amount = (total_amount.saturating_mul(ownership.units)) / total_units;
        distributed = distributed.saturating_add(amount);

        payouts.push_back(DistributionPayout {
            investor: ownership.investor,
            amount,
        });
    }

    let mut remainder = total_amount.saturating_sub(distributed);
    let mut index = 0u32;

    while remainder > 0 && payouts.len() > 0 {
        let mut payout = payouts.get(index).unwrap();
        payout.amount = payout.amount.saturating_add(1);
        payouts.set(index, payout);
        remainder -= 1;
        index = (index + 1) % payouts.len();
    }

    payouts
}

#[contractimpl]
impl AssetRegistryContract {
    pub fn create_asset(
        env: Env,
        creator: Address,
        category: String,
        kind: AssetKind,
        description: String,
        identifier: String,
        units_total: u64,
        unit_price: u64,
        expected_return_amount: u64,
        expected_return_period: String,
        metadata_uri: Option<String>,
    ) -> FarmAsset {
        creator.require_auth();

        if units_total == 0 || unit_price == 0 || expected_return_amount == 0 {
            panic!("Numeric values must be positive integers");
        }

        let asset = FarmAsset {
            asset_id: next_id(&env),
            creator,
            category,
            kind,
            description,
            identifier,
            units_total,
            units_available: units_total,
            unit_price,
            expected_return_amount,
            expected_return_period,
            metadata_uri,
            ownerships: Vec::new(&env),
            distributions: Vec::new(&env),
        };

        let mut assets = read_assets(&env);
        assets.push_back(asset.clone());
        write_assets(&env, &assets);

        asset
    }

    pub fn invest(env: Env, asset_id: u64, investor: Address, units: u64) -> Investment {
        investor.require_auth();

        if units == 0 {
            panic!("Units must be greater than zero");
        }

        let mut assets = read_assets(&env);
        let mut found = false;
        let mut principal = 0u64;

        for i in 0..assets.len() {
            let mut asset = assets.get(i).unwrap();
            if asset.asset_id != asset_id {
                continue;
            }

            found = true;
            if units > asset.units_available {
                panic!("Not enough units available");
            }

            asset.units_available -= units;
            principal = units.saturating_mul(asset.unit_price);

            let mut has_owner = false;
            for j in 0..asset.ownerships.len() {
                let mut ownership = asset.ownerships.get(j).unwrap();
                if ownership.investor == investor {
                    ownership.units = ownership.units.saturating_add(units);
                    asset.ownerships.set(j, ownership);
                    has_owner = true;
                    break;
                }
            }

            if !has_owner {
                asset.ownerships.push_back(Ownership {
                    investor: investor.clone(),
                    units,
                });
            }

            assets.set(i, asset);
            break;
        }

        if !found {
            panic!("Asset not found");
        }

        write_assets(&env, &assets);

        let investment = Investment {
            investment_id: next_id(&env),
            asset_id,
            investor,
            units,
            principal_amount: principal,
        };

        let mut investments = read_investments(&env);
        investments.push_back(investment.clone());
        write_investments(&env, &investments);

        investment
    }

    pub fn distribute_profit(
        env: Env,
        asset_id: u64,
        operator: Address,
        total_amount: u64,
    ) -> ProfitDistribution {
        operator.require_auth();

        if total_amount == 0 {
            panic!("Distribution amount must be positive");
        }

        let mut assets = read_assets(&env);

        for i in 0..assets.len() {
            let mut asset = assets.get(i).unwrap();
            if asset.asset_id != asset_id {
                continue;
            }

            if asset.creator != operator {
                panic!("Only asset creator can distribute profits");
            }

            let payouts = deterministic_payouts(&env, &asset.ownerships, total_amount);
            let distribution = ProfitDistribution {
                distribution_id: next_id(&env),
                total_amount,
                payouts,
            };

            asset.distributions.push_back(distribution.clone());
            assets.set(i, asset);
            write_assets(&env, &assets);
            return distribution;
        }

        panic!("Asset not found");
    }

    pub fn list_assets(env: Env) -> Vec<FarmAsset> {
        read_assets(&env)
    }

    pub fn list_investments(env: Env) -> Vec<Investment> {
        read_investments(&env)
    }
}
