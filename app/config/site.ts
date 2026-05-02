export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  emoji: "🌾",
  name: "crop count",
  description:
    "Stellar-native tokenized agriculture investment platform for crops and livestock",
  blockchain: {
    stellar: {
      horizonUrl:
        process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ||
        process.env.STELLAR_HORIZON_URL ||
        "https://horizon-testnet.stellar.org",
      sorobanRpcUrl:
        process.env.NEXT_PUBLIC_STELLAR_SOROBAN_RPC_URL ||
        process.env.STELLAR_SOROBAN_RPC_URL ||
        "https://soroban-testnet.stellar.org",
      networkPassphrase:
        process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ||
        process.env.STELLAR_NETWORK_PASSPHRASE ||
        "Test SDF Network ; September 2015",
      contractId:
        process.env.NEXT_PUBLIC_STELLAR_CONTRACT_ID ||
        process.env.STELLAR_CONTRACT_ID ||
        "",
      assetCode:
        process.env.NEXT_PUBLIC_STELLAR_ASSET_CODE ||
        process.env.STELLAR_ASSET_CODE ||
        "USDC",
      assetIssuer:
        process.env.NEXT_PUBLIC_STELLAR_ASSET_ISSUER ||
        process.env.STELLAR_ASSET_ISSUER ||
        "",
    },
  },
};
