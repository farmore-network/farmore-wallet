import { useAccount, useBalance, useReadContract } from "wagmi";
import { ABI, CHAIN_ID, CONTRACTS } from "../config";

/** Live balances for the connected account: FAR, and native ETH (gas). */
export function useBalances() {
  const { address } = useAccount();
  const enabled = !!address;

  const eth = useBalance({ address, chainId: CHAIN_ID, query: { enabled, refetchInterval: 15_000 } });
  const far = useReadContract({
    address: CONTRACTS.far,
    abi: ABI.far,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: CHAIN_ID,
    query: { enabled, refetchInterval: 8_000 },
  });

  return {
    eth: eth.data?.value,
    far: far.data as bigint | undefined,
    refetch: () => {
      void eth.refetch();
      void far.refetch();
    },
  };
}
