import { create } from "zustand";
import {
  WalletERC20,
  CollectionBalance,
  CommonChainERC20Balance,
  ChainNFTGroupedByCollection,
  BalanceError,
} from "./types";

export interface TokenBalancesState {
  commonChainERC20Balances: CommonChainERC20Balance[];
  commonChainERC721Balances: ChainNFTGroupedByCollection[];
  commonChainERC1155Balances: ChainNFTGroupedByCollection[];
  commonChainBalanceLoading: boolean;
  commonChainBalanceError: BalanceError;
  balanceQueryContractAddress: string | `0x${string}`;
  erc20BalanceQueryReturn: WalletERC20[];
  erc721BalanceQueryReturn: CollectionBalance[];
  erc1155BalanceQueryReturn: CollectionBalance[];
  balanceQueryLoading: boolean;
  balanceQueryError: BalanceError;
  setCommonChainERC20Balances: (
    commonChainERC20Balances: CommonChainERC20Balance[],
  ) => void;
  setCommonChainERC721Balances: (
    commonChainERC721Balances: ChainNFTGroupedByCollection[],
  ) => void;
  setCommonChainERC1155Balances: (
    commonChainERC1155Balances: ChainNFTGroupedByCollection[],
  ) => void;
  setCommonChainBalanceLoading: (commonChainBalanceLoading: boolean) => void;
  setCommonChainBalanceError: (commonChainBalanceError: BalanceError) => void;
  setBalanceQueryContractAddress: (address: string | `0x${string}`) => void;
  setERC20BalanceQueryReturn: (erc20BalanceQueryReturn: WalletERC20[]) => void;
  setERC721BalanceQueryReturn: (
    erc721BalanceQueryReturn: CollectionBalance[],
  ) => void;
  setERC1155BalanceQueryReturn: (
    erc1155BalanceQueryReturn: CollectionBalance[],
  ) => void;
  setBalanceQueryLoading: (balanceQueryLoading: boolean) => void;
  setBalanceQueryError: (balanceQueryError: BalanceError) => void;
}

export const useTokenBalancesStore = create<TokenBalancesState>((set) => {
  const initialState = {
    commonChainERC20Balances: [
      {
        chainName: "Ethereum Mainnet",
        balance: [],
      },
    ],
    commonChainERC721Balances: [],
    commonChainERC1155Balances: [],
    commonChainBalanceLoading: true,
    commonChainBalanceError: { isError: false, message: "" },
    balanceQueryContractAddress: "",
    erc20BalanceQueryReturn: [],
    erc721BalanceQueryReturn: [],
    erc1155BalanceQueryReturn: [],
    balanceQueryLoading: false,
    balanceQueryError: { isError: false, message: "" },
  };

  return {
    ...initialState,
    setCommonChainERC20Balances: (
      commonChainERC20Balances: CommonChainERC20Balance[],
    ) => set({ commonChainERC20Balances }),
    setCommonChainERC721Balances: (
      commonChainERC721Balances: ChainNFTGroupedByCollection[],
    ) => set({ commonChainERC721Balances }),
    setCommonChainERC1155Balances: (
      commonChainERC1155Balances: ChainNFTGroupedByCollection[],
    ) => set({ commonChainERC1155Balances }),
    setCommonChainBalanceLoading: (commonChainBalanceLoading: boolean) =>
      set({ commonChainBalanceLoading }),
    setCommonChainBalanceError: (commonChainBalanceError: BalanceError) =>
      set({ commonChainBalanceError }),
    setBalanceQueryContractAddress: (address: string | `0x${string}`) =>
      set({ balanceQueryContractAddress: address }),
    setERC20BalanceQueryReturn: (erc20BalanceQueryReturn: WalletERC20[]) =>
      set({ erc20BalanceQueryReturn }),
    setERC721BalanceQueryReturn: (
      erc721BalanceQueryReturn: CollectionBalance[],
    ) => set({ erc721BalanceQueryReturn }),
    setERC1155BalanceQueryReturn: (
      erc1155BalanceQueryReturn: CollectionBalance[],
    ) => set({ erc1155BalanceQueryReturn }),
    setBalanceQueryLoading: (balanceQueryLoading: boolean) =>
      set({ balanceQueryLoading }),
    setBalanceQueryError: (balanceQueryError: BalanceError) =>
      set({ balanceQueryError }),
  };
});
