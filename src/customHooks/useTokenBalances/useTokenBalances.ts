import { useState } from "react";
import { useAccount } from "wagmi";
import Moralis from "moralis";
import { moralisEvmChains } from "~/configs/moralis";
import {
  EvmChain,
  type Erc20Value,
  type EvmNft,
} from "moralis/common-evm-utils";
import { type MoralisDataObjectValue, BigNumber } from "moralis/common-core";

type WalletERC20 = {
  id: number;
  chain: string;
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
  thumbnail?: string;
  amount: string;
};

type WalletNFTMetadata = {
  description: string;
  image: string;
  name: string;
};

export type WalletNFT = {
  id: number;
  chain: string;
  contractType: string;
  collectionName: string;
  tokenId: string | number;
  metadata?: MoralisDataObjectValue;
};

type CommonNFTBalanceReturn = Record<string, WalletNFT[]>;
type CommonERC20BalanceReturn = Record<string, WalletERC20[]>;

export function useTokenBalances() {
  const [balanceError, setBalanceError] = useState<{
    isError: boolean;
    message?: string;
  }>({ isError: false, message: "" });
  const { isConnected, address } = useAccount();

  const getCommonChainERC20Balance =
    async (): Promise<CommonERC20BalanceReturn | null> => {
      try {
        runFetchBalanceChecks();

        const allBalances: Array<Erc20Value[]> = [];

        for (const chain of moralisEvmChains.Common) {
          const response = await Moralis.EvmApi.token.getWalletTokenBalances({
            address: address as string,
            chain,
          });
          allBalances.push(response.result);
        }

        const [chainOne, chainTwo, chainThree] = allBalances;
        const chainOneBalance = formatERC20Return(chainOne ?? []);
        const chainTwoBalance = formatERC20Return(chainTwo ?? []);
        const chainThreeBalance = formatERC20Return(chainThree ?? []);

        return { chainOneBalance, chainTwoBalance, chainThreeBalance };
      } catch (error) {
        setError(true);
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
      setError(true);
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
      setError(true);
      return null;
    }
  };

  const getCommonChainNFTs = async (
    limit?: number,
  ): Promise<CommonNFTBalanceReturn | null> => {
    try {
      runFetchBalanceChecks();

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
      const chainOneBalance = formatWalletNFTReturn(chainOne ?? []);
      const chainTwoBalance = formatWalletNFTReturn(chainTwo ?? []);
      const chainThreeBalance = formatWalletNFTReturn(chainThree ?? []);

      return { chainOneBalance, chainTwoBalance, chainThreeBalance };
    } catch (error) {
      setError(true);
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
      setError(true);
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

  const setError = (isError: boolean, message?: string): void => {
    setBalanceError({
      isError,
      message:
        message ?? "External services error - balances could not be fetched",
    });
  };

  return {
    getCommonChainERC20Balance,
    getERC20BalanceByChain,
    getERC20BalanceByContractAddress,
    getCommonChainNFTs,
    getNFTsByChain,
    balanceError,
  };
}
