"use client";

import { createContext, useContext } from "react";

export type WalletAccount = {
    address: string;
};

export type WalletOption = {
    name: "Freighter" | "Manual";
    available: boolean;
};

export type WalletContextValue = {
    connected: boolean;
    account?: WalletAccount;
    wallets: WalletOption[];
    connect: (walletName: WalletOption["name"], manualAddress?: string) => Promise<void>;
    disconnect: () => Promise<void>;
};

export const WalletContext = createContext<WalletContextValue | null>(null);

export function useWallet(): WalletContextValue {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error("useWallet must be used within StellarProvider");
    }

    return context;
}
