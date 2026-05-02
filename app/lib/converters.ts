/**
 * Convert a long wallet address to compact form like "0x43...c4b1".
 */
export function addressToShortAddress(
  address: string | undefined
): string | undefined {
  let shortAddress = address;
  if (address && address.length > 10) {
    shortAddress = `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  }
  return shortAddress?.toLowerCase();
}
