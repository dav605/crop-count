# crop count

crop count is a Stellar-native tokenized agriculture investment platform.

It allows operators to create crop/livestock assets with fractional units, lets investors buy units using a stable settlement token, and distributes profits deterministically based on ownership proportions.

## Architecture

- Smart contracts: Stellar Soroban package in [contracts/soroban](contracts/soroban)
- Frontend and API: Next.js app in [app](app)
- Wallets: Freighter (with manual Stellar public key fallback)

## Core Model

- Asset tokenization:
  - Each farm asset stores immutable metadata plus mutable unit supply and ownership state.
  - Asset kinds are extensible (`crop`, `livestock`, additional enum values can be added).
- Fractional ownership:
  - Investors buy integer units.
  - Ownership is tracked as integer unit balances per investor.
- Investment accounting:
  - Principal = `units * unit_price` in stable token base units.
  - No floating point is used anywhere.
- Deterministic profit distribution:
  - Per-investor payout = `floor(total_amount * investor_units / total_units)`.
  - Remainder is assigned deterministically in a stable pass.

## Smart Contracts

### Stellar Soroban

- [contracts/soroban/asset-registry/src/lib.rs](contracts/soroban/asset-registry/src/lib.rs)
  - `create_asset`, `invest`, and `distribute_profit` entrypoints.
  - Integer-only accounting and deterministic remainder payout pass.

## Backend (Next.js API)

- [app/app/api/assets/route.ts](app/app/api/assets/route.ts)
  - Create/list assets
- [app/app/api/assets/[assetId]/investments/route.ts](app/app/api/assets/[assetId]/investments/route.ts)
  - Submit investments
- [app/app/api/assets/[assetId]/distributions/route.ts](app/app/api/assets/[assetId]/distributions/route.ts)
  - Execute profit distributions
- [app/app/api/investments/route.ts](app/app/api/investments/route.ts)
  - Investor portfolio history
- [app/app/api/events/route.ts](app/app/api/events/route.ts)
  - Indexed event feed (local + on-chain when available)

## Frontend

- Asset listing: [app/app/explore/page.tsx](app/app/explore/page.tsx)
- Asset detail view: [app/app/explore/[assetId]/page.tsx](app/app/explore/[assetId]/page.tsx)
- Farm operator view: [app/app/farm/page.tsx](app/app/farm/page.tsx)
- Investor portfolio: [app/app/investments/page.tsx](app/app/investments/page.tsx)
- Creator profiles: [app/app/creators/[creator]/page.tsx](app/app/creators/[creator]/page.tsx)
- Asset creation: [app/app/farm/tokens/new/page.tsx](app/app/farm/tokens/new/page.tsx)

## Local Setup

1. Install frontend dependencies:
   - `cd app && npm install`
2. Configure environment in [app/.env](app/.env)
3. Start frontend:
   - `npm run dev`
4. Build Soroban scaffold (optional during UI/API development):
  - `cd ../contracts && npm run soroban:build`

## Security Notes

- Integer-safe accounting only (`u64` / bigint).
- Deterministic payout math to ensure verifiable settlement.
- Soroban scaffold is intentionally staged and does not yet include payment settlement checks.
