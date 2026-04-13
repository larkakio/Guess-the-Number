import { type Hex } from "viem";
import { Attribution } from "ox/erc8021";

/**
 * ERC-8021 calldata suffix for Base Builder Codes.
 * Prefer env override when tooling requires a fixed hex (rare).
 */
export function getBuilderDataSuffix(): Hex | undefined {
  const override = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX;
  if (override?.startsWith("0x") && override.length > 2) {
    return override as Hex;
  }
  const code = process.env.NEXT_PUBLIC_BUILDER_CODE;
  if (!code?.trim()) {
    return undefined;
  }
  return Attribution.toDataSuffix({
    codes: [code.trim()],
  }) as Hex;
}
