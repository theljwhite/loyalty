import { create } from "zustand";

//this store is temporary for now, as this flow may not necessarily need it

type ERC1155Deposit = {
  tokenId: string;
  value: number;
};

type DepositReceipt = {
  hash: string;
  gasUsed: bigint;
  gasPrice: bigint;
};

export type TransactionItemType =
  | "UNKNOWN"
  | "DEPOSIT"
  | "CONTRACT_CREATION"
  | "CONTRACT_CALL";

export type TransactionsListItem = {
  to: string | null;
  from: string | null;
  amount: string | null;
  time: Date;
  type: TransactionItemType;
  blockHash: string | null;
};

export interface DepositRewardsState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string;
  erc20DepositAmount: string;
  erc721DepositAmount: number;
  erc1155DepositAmount: number;
  erc721Deposit: string[];
  erc1155Deposit: ERC1155Deposit[];
  depositReceipt: DepositReceipt;
  transactionList: TransactionsListItem[];
  txListLoading: boolean;
  txListError: string;
  txListSuccess: boolean;
  isDepositReceiptOpen: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setIsSuccess: (isSuccess: boolean) => void;
  setError: (error: string) => void;
  setERC20DepositAmount: (erc20DepositAmount: string) => void;
  setERC721DepositAmount: (erc721DepositAmount: number) => void;
  setERC1155DepositAmount: (erc1155DepositAmount: number) => void;
  setERC721Deposit: (erc721Deposit: string[]) => void;
  setERC1155Deposit: (erc1155Deposit: ERC1155Deposit[]) => void;
  setDepositReceipt: (depositReceipt: DepositReceipt) => void;
  setTransactionList: (transactionList: TransactionsListItem[]) => void;
  setTxListLoading: (txListLoading: boolean) => void;
  setTxListError: (txListError: string) => void;
  setTxListSuccess: (txListSuccess: boolean) => void;
  setIsDepositReceiptOpen: (isDepositReceiptOpen: boolean) => void;
}

export const useDepositRewardsStore = create<DepositRewardsState>((set) => {
  const initialState = {
    isLoading: false,
    isSuccess: false,
    error: "",
    erc20DepositAmount: "",
    erc721DepositAmount: 0,
    erc1155DepositAmount: 0,
    erc721Deposit: [],
    erc1155Deposit: [],
    depositReceipt: {
      hash: "",
      gasUsed: BigInt(0),
      gasPrice: BigInt(0),
    },
    transactionList: [],
    txListLoading: false,
    txListError: "",
    txListSuccess: false,
    isDepositReceiptOpen: false,
  };

  return {
    ...initialState,
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    setIsSuccess: (isSuccess: boolean) => set({ isSuccess }),
    setError: (error: string) => set({ error }),
    setERC20DepositAmount: (erc20DepositAmount: string) =>
      set({ erc20DepositAmount }),
    setERC721DepositAmount: (erc721DepositAmount: number) =>
      set({ erc721DepositAmount }),
    setERC1155DepositAmount: (erc1155DepositAmount) =>
      set({ erc1155DepositAmount }),
    setERC721Deposit: (erc721Deposit: string[]) => set({ erc721Deposit }),
    setERC1155Deposit: (erc1155Deposit: ERC1155Deposit[]) =>
      set({ erc1155Deposit }),
    setDepositReceipt: (depositReceipt: DepositReceipt) =>
      set({ depositReceipt }),
    setTransactionList: (transactionList: TransactionsListItem[]) =>
      set({ transactionList }),
    setTxListLoading: (txListLoading: boolean) => set({ txListLoading }),
    setTxListError: (txListError: string) => set({ txListError }),
    setTxListSuccess: (txListSuccess: boolean) => set({ txListSuccess }),
    setIsDepositReceiptOpen: (isDepositReceiptOpen: boolean) =>
      set({ isDepositReceiptOpen }),
  };
});
