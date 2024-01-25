import { type MoralisDataObjectValue } from "moralis/common-core";

export type CommonChainBalanceType = "ERC20" | "ERC721" | "ERC1155";

export type CommonChainERC20Balance = {
  chainName: string;
  balance: WalletERC20[];
};
export type CommonChainNFTBalance = {
  chainName: string;
  balance: WalletNFT[];
};

export type CollectionBalance = {
  collectionName: string;
  tokenIds: string[];
  contractType?: string;
};

export type ChainNFTGroupedByCollection = {
  chainName: string;
  balance: CollectionBalance[];
};

export type BalanceError = {
  isError: boolean;
  message: string;
};

export type WalletERC20 = {
  id: number;
  chain: string;
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
  thumbnail?: string;
  amount: string;
};

export type WalletNFTMetadata = {
  description: string;
  image: string;
  name: string;
};

export type NFTCollection = {
  id: number;
  contractType: string;
  tokenAddress: string;
  name: string;
  symbol: string;
};

export type WalletNFT = {
  id: number;
  chain: string;
  contractType: string;
  collectionName: string;
  tokenId: string | number;
  metadata?: MoralisDataObjectValue;
};
