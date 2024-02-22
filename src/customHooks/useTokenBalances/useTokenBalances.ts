import { useAccount } from "wagmi";
import Moralis from "moralis";
import { moralisEvmChains } from "~/configs/moralis";
import {
  EvmChain,
  type Erc20Value,
  type EvmNft,
  type EvmNftCollection,
} from "moralis/common-evm-utils";
import { BigNumber } from "moralis/common-core";
import {
  type WalletERC20,
  type WalletNFT,
  type WalletNFTMetadata,
  type NFTCollection,
  BalanceError,
} from "./types";
import { useTokenBalancesStore } from "./store";

//TODO - add rate limiting to calls

export type CommonChainNFTReturn = Record<string, WalletNFT[]>;
export type CommonChainERC20Return = Record<string, WalletERC20[]>;
type ERC20ChainBalance = { chainName: string; balance: Erc20Value[] };
type NFTChainBalance = { chainName: string; balance: EvmNft[] };

export function useTokenBalances() {
  const { setCommonChainBalanceError, setBalanceQueryError } =
    useTokenBalancesStore();
  const { isConnected, address } = useAccount();

  const getCommonChainERC20Balance =
    async (): Promise<CommonChainERC20Return | null> => {
      try {
        runFetchBalanceChecks();

        const allBalances: ERC20ChainBalance[] = [];

        for (const chain of moralisEvmChains.Common) {
          const response = await Moralis.EvmApi.token.getWalletTokenBalances({
            address: address as string,
            chain,
          });
          allBalances.push({
            chainName: chain.name ?? "",
            balance: response.result,
          });
        }
        const [chainOne, chainTwo, chainThree] = allBalances;
        const chainOneBalance = formatERC20Return(chainOne?.balance ?? []);
        const chainTwoBalance = formatERC20Return(chainTwo?.balance ?? []);
        const chainThreeBalance = formatERC20Return(chainThree?.balance ?? []);

        return {
          [chainOne?.chainName ?? "1"]: chainOneBalance,
          [chainTwo?.chainName ?? "2"]: chainTwoBalance,
          [chainThree?.chainName ?? "3"]: chainThreeBalance,
        };
      } catch (error) {
        setCommonChainBalanceError(handleError(error));
        return null;
      }
    };

  const getERC20BalanceByChain = async (
    evmChain: EvmChain,
  ): Promise<WalletERC20[] | null> => {
    try {
      runFetchBalanceChecks();
      const response = await Moralis.EvmApi.token.getWalletTokenBalances({
        address: address as string,
        chain: evmChain,
      });
      const balance = formatERC20Return(response.result);

      return balance;
    } catch (error) {
      setBalanceQueryError(handleError(error));
      return null;
    }
  };

  const getERC20BalanceByContractAddress = async (
    contractAddresses: string[],
    evmChain: EvmChain,
  ): Promise<WalletERC20[] | null> => {
    try {
      runFetchBalanceChecks();

      const response = await Moralis.EvmApi.token.getWalletTokenBalances({
        address: address as string,
        chain: evmChain,
        tokenAddresses: contractAddresses,
      });
      const balance = formatERC20Return(response.result);
      return balance;
    } catch (error) {
      setBalanceQueryError(handleError(error));
      return null;
    }
  };

  const getCommonChainNFTs = async (
    limit?: number,
  ): Promise<CommonChainNFTReturn | null> => {
    try {
      runFetchBalanceChecks();

      const allBalances: NFTChainBalance[] = [];

      for (const chain of moralisEvmChains.Common) {
        const response = await Moralis.EvmApi.nft.getWalletNFTs({
          address: address as string,
          chain,
          limit,
        });
        allBalances.push({
          chainName: chain.name ?? "",
          balance: response.result,
        });
      }

      const [chainOne, chainTwo, chainThree] = allBalances;
      const chainOneBalance = formatWalletNFTReturn(chainOne?.balance ?? []);
      const chainTwoBalance = formatWalletNFTReturn(chainTwo?.balance ?? []);
      const chainThreeBalance = formatWalletNFTReturn(
        chainThree?.balance ?? [],
      );

      return {
        [chainOne?.chainName ?? "1"]: chainOneBalance,
        [chainTwo?.chainName ?? "2"]: chainTwoBalance,
        [chainThree?.chainName ?? "3"]: chainThreeBalance,
      };
    } catch (error) {
      setCommonChainBalanceError(handleError(error));
      return null;
    }
  };

  const getNFTsByChain = async (
    evmChain: EvmChain,
    limit?: number,
  ): Promise<WalletNFT[] | null> => {
    try {
      runFetchBalanceChecks();
      const response = await Moralis.EvmApi.nft.getWalletNFTs({
        address: address as string,
        chain: evmChain,
        limit,
      });
      const balance = formatWalletNFTReturn(response.result);
      return balance;
    } catch (error) {
      setBalanceQueryError(handleError(error));
      return null;
    }
  };

  const getNFTsByContract = async (
    contractAddress: string,
    evmChain: EvmChain,
    limit?: number,
  ): Promise<WalletNFT[] | null> => {
    try {
      runFetchBalanceChecks();
      const response = await Moralis.EvmApi.nft.getContractNFTs({
        chain: evmChain,
        address: contractAddress,
        format: "decimal",
        limit,
      });
      const balance = response.result;
      const formattedNfts = formatWalletNFTReturn(balance);
      return formattedNfts;
    } catch (error) {
      setBalanceQueryError(handleError(error));
      return null;
    }
  };

  const getNFTCollections = async (
    evmChain: EvmChain,
    limit?: number,
  ): Promise<NFTCollection[] | null> => {
    try {
      runFetchBalanceChecks();
      const response = await Moralis.EvmApi.nft.getWalletNFTCollections({
        address: address as string,
        chain: evmChain,
        limit,
      });
      const balance = response.result;
      const formattedBalance = balance.map(
        (item: EvmNftCollection, index: number) => ({
          id: index,
          contractType: item.contractType ?? "",
          name: item.name ?? "",
          symbol: item.symbol ?? "",
          tokenAddress: item.tokenAddress.toJSON(),
        }),
      );
      return formattedBalance;
    } catch (error) {
      setBalanceQueryError(handleError(error));
      return null;
    }
  };

  const formatERC20Return = (balance: Erc20Value[]): WalletERC20[] => {
    if (!balance || balance.length == 0) return [];

    const formattedTokens = balance
      .filter((item: Erc20Value) => !item.token?.possibleSpam)
      .map((item: Erc20Value, index: number) => ({
        id: index,
        chain: item.token?.chain.name ?? "",
        name: item.token?.name ?? "",
        symbol: item.token?.symbol ?? "",
        decimals: item.decimals,
        logo: item.token?.logo ?? "",
        thumbnail: item.token?.thumbnail ?? "",
        amount: BigNumber.create(item.amount).toDecimal(item.decimals),
      }));

    return formattedTokens;
  };

  const formatWalletNFTReturn = (balance: EvmNft[]): WalletNFT[] => {
    if (!balance || balance.length == 0) return [];

    const formattedTokens = balance
      .filter((item: EvmNft) => !item.possibleSpam)
      .map((item: EvmNft, index: number) => {
        const metadata = item.metadata && (item.metadata as WalletNFTMetadata);
        const formattedMetadata: WalletNFTMetadata = {
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

    return formattedTokens;
  };

  const runFetchBalanceChecks = async (): Promise<boolean> => {
    if (!isConnected || !address) {
      return false;
    }
    if (!Moralis.Core.isStarted) {
      await Moralis.start({
        apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
      });
      return true;
    }
    return true;
  };

  const handleError = (error: any): BalanceError => {
    const isAddressError = JSON.stringify(error).includes(
      "Moralis SDK Core Error",
    );
    return {
      isError: true,
      message: isAddressError
        ? "Could not fetch balances. Your wallet is not connected."
        : "External services error - balances could not be fetched",
    };
  };

  return {
    getCommonChainERC20Balance,
    getERC20BalanceByChain,
    getERC20BalanceByContractAddress,
    getCommonChainNFTs,
    getNFTsByChain,
    getNFTCollections,
    getNFTsByContract,
  };
}
