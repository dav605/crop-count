# crop count Smart Contracts

This directory contains the Stellar Soroban contracts for crop count.

## Modules

- `soroban/asset-registry`: Soroban contract for asset creation, investment accounting, and deterministic profit distribution.

## Prerequisites

- Rust toolchain
- `soroban-cli`

## Commands

- Build contract:
  - `cd soroban/asset-registry`
  - `cargo build --target wasm32-unknown-unknown --release`

## Notes

- All accounting is integer-based (`u64`) to avoid floating-point errors.
- Profit distribution uses deterministic proportional allocation with remainder resolution.
