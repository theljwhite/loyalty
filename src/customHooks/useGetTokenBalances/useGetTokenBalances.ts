import { useAccount, useNetwork } from "wagmi";
import Moralis from "moralis";
import { moralisEvmChains } from "~/configs/moralis";
import { type EvmNft } from "moralis/common-evm-utils";
import { type MoralisDataObjectValue } from "moralis/common-core";

type WalletTokenMetadata = {
  description: string;
  image: string;
  name: string;
};

export type WalletTokenReturn = {
  id: number;
  chain: string;
  contractType: string;
  collectionName: string;
  tokenId: string | number;
  metadata?: MoralisDataObjectValue;
};

type CommonChainBalanceReturn = Record<string, WalletTokenReturn[]>;

export function useGetTokenBalances() {
  const { isConnected, address } = useAccount();
  const { chain: userConnectedChain } = useNetwork();

  const getCommonChainWalletTokens = async (
    limit?: number,
  ): Promise<CommonChainBalanceReturn | null> => {
    try {
      if (!isConnected || !address) {
        throw new Error("User's wallet is not connected");
      }
      if (!Moralis.Core.isStarted) {
        await Moralis.start({
          apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
        });
      }

      const allBalances: Array<EvmNft[]> = [];

      for (const chain of moralisEvmChains.Common) {
        const response = await Moralis.EvmApi.nft.getWalletNFTs({
          address: address as string,
          chain,
          limit,
        });
        allBalances.push(response.result);
      }

      const [chainOne, chainTwo, chainThree] = allBalances;
      const chainOneBalance = formatWalletTokenReturn(chainOne ?? []);
      const chainTwoBalance = formatWalletTokenReturn(chainTwo ?? []);
      const chainThreeBalance = formatWalletTokenReturn(chainThree ?? []);

      return { chainOneBalance, chainTwoBalance, chainThreeBalance };
    } catch (error) {
      console.error("TODO error handle", error);
      return null;
    }
  };

  const formatWalletTokenReturn = (balance: EvmNft[]): WalletTokenReturn[] => {
    if (!balance || balance.length == 0) return [];

    const formattedToken = balance
      .filter((item: EvmNft) => !item.possibleSpam)
      .map((item: EvmNft, index: number) => {
        const metadata =
          item.metadata && (item.metadata as WalletTokenMetadata);
        const formattedMetadata: WalletTokenMetadata = {
          name: metadata?.name ?? "",
          description: metadata?.description ?? "",
          image: metadata?.image ?? "",
        };

        const token = {
          id: index,
          chain: item.chain.name ?? "",
          contractType: item.contractType ?? "",
          collectionName: item.name ?? "",
          tokenId: item.tokenId,
          metadata: formattedMetadata,
        };
        return token;
      });

    return formattedToken;
  };

  return { getCommonChainWalletTokens };
}
