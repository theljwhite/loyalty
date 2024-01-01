import { create } from "zustand";

type RewardInfo = {
  name: string;
  symbol: string;
  decimals: number | null;
};

export interface EscrowApprovalsState {
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
  isModalOpen: boolean;
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
  setIsModalOpen: (isModalOpen: boolean) => void;
}

export const useEscrowApprovalsStore = create<EscrowApprovalsState>((set) => {
  const depositEnd: Date = new Date();
  depositEnd.setTime(depositEnd.getTime() + 1 * 60 * 60 * 1000);
  const initialState = {
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
  };

  return {
    ...initialState,
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
    setIsModalOpen: (isModalOpen: boolean) => set({ isModalOpen }),
  };
});
