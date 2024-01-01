import { create } from "zustand";

export type EscrowType = "ERC20" | "ERC721" | "ERC1155";
export enum EscrowContractState {
  Idle,
  AwaitingEscrowApprovals,
  DepositPeriod,
  AwaitingEscrowSettings,
  InIssuance,
  Completed,
  Frozen,
  Canceled,
}

export interface DeployEscrowState {
  escrowType: EscrowType;
  contractState: EscrowContractState;
  isLoading: boolean;
  isSuccess: boolean;
  error: string;
  isCanceled: boolean;
  deployEscrowData: {
    hash: string;
    address: string;
  };
  isEscrowContractSetInLoyalty: boolean;
  setEscrowType: (escrowType: EscrowType) => void;
  setContractState: (escrowState: EscrowContractState) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsSuccess: (isSuccess: boolean) => void;
  setError: (error: string) => void;
  setIsCanceled: (isCanceled: boolean) => void;
  setDeployEscrowData: (hash: string, address: string) => void;
  setIsEscrowContractSetInLoyalty: (isSet: boolean) => void;
  reset: () => void;
}

export const useDeployEscrowStore = create<DeployEscrowState>((set, get) => {
  const initialState = {
    escrowType: "ERC20" as EscrowType,
    contractState: EscrowContractState.Idle,
    isLoading: false,
    isSuccess: false,
    error: "",
    isCanceled: false,
    deployEscrowData: {
      hash: "",
      address: "",
    },
    isEscrowContractSetInLoyalty: false,
  };

  return {
    ...initialState,
    setEscrowType: (escrowType: EscrowType) => set({ escrowType }),
    setContractState: (contractState: EscrowContractState) =>
      set({ contractState }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setIsSuccess: (isSuccess) => set({ isSuccess }),
    setError: (error) => set({ error }),
    setIsCanceled: (isCanceled) => set({ isCanceled }),
    setDeployEscrowData: (hash: string, address: string) =>
      set({ deployEscrowData: { hash, address } }),
    setIsEscrowContractSetInLoyalty: (isSet: boolean) =>
      set({ isEscrowContractSetInLoyalty: isSet }),
    reset: () => set({ ...initialState }),
  };
});
