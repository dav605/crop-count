"use client";

import { addressToShortAddress } from "@/lib/converters";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "./ui/button";
import useError from "@/hooks/useError";

export function SiteHeaderConnectButton() {
  const { handleError } = useError();
  const { connected, account, wallets, connect, disconnect } = useWallet();

  if (!connected) {
    const freighterWallet = wallets.find((wallet) => wallet.name === "Freighter");

    async function connectManual() {
      try {
        const address = window.prompt("Paste your Stellar public key (starts with G)");
        if (!address) {
          return;
        }
        await connect("Manual", address);
      } catch (error) {
        handleError(error instanceof Error ? error : new Error(String(error)), true);
      }
    }

    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!freighterWallet?.available}
          onClick={async () => {
            try {
              await connect("Freighter");
            } catch (error) {
              handleError(
                error instanceof Error ? error : new Error(String(error)),
                true
              );
            }
          }}
        >
          Connect Freighter
        </Button>
        <Button variant="outline" size="sm" onClick={connectManual}>
          Use Address
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={async () => {
        await disconnect();
      }}
    >
      Disconnect
      {account?.address && (
        <span className="text-xs text-muted-foreground pl-1">
          ({addressToShortAddress(account.address)})
        </span>
      )}
    </Button>
  );
}
