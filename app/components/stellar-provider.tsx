"use client";

import { WalletContext, WalletContextValue } from "@/hooks/useWallet";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "crop-count.stellar.address";

declare global {
  interface Window {
    freighterApi?: {
      getPublicKey?: () => Promise<string>;
    };
  }
}

function isValidStellarAddress(address: string): boolean {
  const normalized = address.trim();
  return /^G[A-Z2-7]{55}$/.test(normalized);
}

export function StellarProvider({ children }: { children: React.ReactNode }) {
  const [accountAddress, setAccountAddress] = useState<string | undefined>();
  const [isFreighterAvailable, setIsFreighterAvailable] = useState(false);

  useEffect(() => {
    setIsFreighterAvailable(Boolean(window.freighterApi?.getPublicKey));
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && isValidStellarAddress(saved)) {
      setAccountAddress(saved);
    }
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      connected: Boolean(accountAddress),
      account: accountAddress ? { address: accountAddress } : undefined,
      wallets: [
        { name: "Freighter", available: isFreighterAvailable },
        { name: "Manual", available: true },
      ],
      connect: async (walletName, manualAddress) => {
        if (walletName === "Freighter") {
          if (!window.freighterApi?.getPublicKey) {
            throw new Error("Freighter wallet is not available in this browser");
          }

          const publicKey = await window.freighterApi.getPublicKey();
          if (!isValidStellarAddress(publicKey)) {
            throw new Error("Freighter returned an invalid Stellar address");
          }

          setAccountAddress(publicKey);
          window.localStorage.setItem(STORAGE_KEY, publicKey);
          return;
        }

        const candidate = (manualAddress || "").trim();
        if (!isValidStellarAddress(candidate)) {
          throw new Error("Provide a valid Stellar public key address");
        }

        setAccountAddress(candidate);
        window.localStorage.setItem(STORAGE_KEY, candidate);
      },
      disconnect: async () => {
        setAccountAddress(undefined);
        window.localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [accountAddress, isFreighterAvailable]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
