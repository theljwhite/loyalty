import { create } from "zustand";
import { type EscrowType } from "@prisma/client";

type RewardInfo = {
  name: string;
  symbol: string;
  decimals: number | null;
};

export interface EscrowApprovalsState {
  escrowType: EscrowType;
  senderAddress: string;
  rewardAddress: string;
  rewardInfo: RewardInfo;
  depositKey: string;
  depositPeriodEndsAt: Date;
  approvalsCount: number;
  isSenderApproved: boolean;
  isRewardAddressApproved: boolean;
  isDepositKeySet: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  error: string;
  setEscrowType: (escrowType: EscrowType) => void;
  setSenderAddress: (senderAddress: string) => void;
  setRewardAddress: (rewardAddress: string) => void;
  setRewardInfo: (rewardInfo: RewardInfo) => void;
  setDepositKey: (depositKey: string) => void;
  setDepositPeriodEndsAt: (depositPeriodEndsAt: Date) => void;
  setApprovalsCount: (approvalsCount: number) => void;
  setIsSenderApproved: (isSenderApproved: boolean) => void;
  setIsRewardAddressApproved: (isRewardAddressApproved: boolean) => void;
  setIsDepositKeySet: (isDepositKeySet: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsSuccess: (isSuccess: boolean) => void;
  setError: (error: string) => void;
}

export const useEscrowApprovalsStore = create<EscrowApprovalsState>((set) => {
  const depositEnd: Date = new Date();
  depositEnd.setTime(depositEnd.getTime() + 1 * 60 * 60 * 1000);
  const initialState = {
    escrowType: "ERC20" as EscrowType,
    senderAddress: "",
    rewardAddress: "",
    rewardInfo: {
      name: "",
      symbol: "",
      decimals: 18,
    },
    depositKey: "",
    depositPeriodEndsAt: depositEnd,
    approvalsCount: 0,
    isSenderApproved: false,
    isRewardAddressApproved: false,
    isDepositKeySet: false,
    isLoading: false,
    isSuccess: false,
    error: "",
    isModalOpen: false,
    step: 0,
    furthestStep: 0,
  };

  return {
    ...initialState,
    setEscrowType: (escrowType: EscrowType) => set({ escrowType }),
    setSenderAddress: (senderAddress: string) => set({ senderAddress }),
    setRewardAddress: (rewardAddress: string) => set({ rewardAddress }),
    setRewardInfo: (rewardInfo: RewardInfo) => set({ rewardInfo }),
    setDepositKey: (depositKey: string) => set({ depositKey }),
    setDepositPeriodEndsAt: (depositPeriodEndsAt: Date) =>
      set({ depositPeriodEndsAt }),
    setApprovalsCount: (approvalsCount: number) => set({ approvalsCount }),
    setIsSenderApproved: (isSenderApproved: boolean) =>
      set({ isSenderApproved }),
    setIsRewardAddressApproved: (isRewardAddressApproved: boolean) =>
      set({ isRewardAddressApproved }),
    setIsDepositKeySet: (isDepositKeySet: boolean) => ({ isDepositKeySet }),
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    setIsSuccess: (isSuccess: boolean) => set({ isSuccess }),
    setError: (error: string) => set({ error }),
  };
});
