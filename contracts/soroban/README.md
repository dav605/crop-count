# crop count Soroban Contracts

This folder contains the Stellar Soroban contract migration scaffold.

## Current package

- asset-registry: parity-oriented contract for asset creation, investment accounting, and deterministic profit distribution.

## Prerequisites

- Rust toolchain
- soroban-cli

## Build

cd soroban/asset-registry
cargo build --target wasm32-unknown-unknown --release

## Notes

- This contract is the first migration scaffold and focuses on API parity with the current app layer.
- Payment settlement and token transfer verification are intentionally staged for a follow-up milestone.
