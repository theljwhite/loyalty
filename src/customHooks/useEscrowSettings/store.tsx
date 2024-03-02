import { create } from "zustand";
import {
  ERC20RewardCondition,
  ERC721RewardCondition,
  ERC1155RewardCondition,
  ERC721RewardOrder,
} from "./types";
import { type Objective } from "@prisma/client";

export interface EscrowSettingsState {
  isLoading: boolean;
  isSuccess: boolean;
  isConfirmModalOpen: boolean;
  error: string;
  erc20RewardCondition: ERC20RewardCondition;
  erc721RewardCondition: ERC721RewardCondition;
  erc1155RewardCondition: ERC1155RewardCondition;
  erc721RewardOrder: ERC721RewardOrder;
  rewardGoal: string;
  rewardTokenId: string;
  payoutAmount: number;
  payoutAmounts: number[];
  rewardTokenIds: string[];
  areTokensValid: boolean;
  areAmountsValid: boolean;
  isRewardGoalValid: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setIsSuccess: (isSuccess: boolean) => void;
  setIsConfirmModalOpen: (isConfirmModalOpen: boolean) => void;
  setError: (error: string) => void;
  setERC20RewardCondition: (erc20RewardCondition: ERC20RewardCondition) => void;
  setERC721RewardCondition: (
    erc721RewadCondition: ERC721RewardCondition,
  ) => void;
  setERC1155RewardCondition: (
    erc1155RewardCondition: ERC1155RewardCondition,
  ) => void;
  setERC721RewardOrder: (erc721RewardOrder: ERC721RewardOrder) => void;
  setRewardGoal: (rewardGoal: string) => void;
  setRewardTokenId: (rewardTokenId: string) => void;
  setPayoutAmount: (payoutAmount: number) => void;
  setPayoutAmounts: (payoutAmounts: number[]) => void;
  setRewardTokenIds: (rewardTokenIds: string[]) => void;
  setAreTokensValid: (areTokensValid: boolean) => void;
  setAreAmountsValid: (areAmountsValid: boolean) => void;
  setIsRewardGoalValid: (isRewardGoalValid: boolean) => void;
}

export const useEscrowSettingsStore = create<EscrowSettingsState>((set) => {
  const initialState = {
    isLoading: false,
    isSuccess: false,
    isConfirmModalOpen: false,
    error: "",
    erc20RewardCondition: ERC20RewardCondition.NotSet,
    erc721RewardCondition: ERC721RewardCondition.NotSet,
    erc1155RewardCondition: ERC1155RewardCondition.NotSet,
    erc721RewardOrder: ERC721RewardOrder.NotSet,
    rewardGoal: "",
    rewardTokenId: "",
    payoutAmount: 0,
    payoutAmounts: [],
    rewardTokenIds: [],
    areTokensValid: false,
    areAmountsValid: false,
    isRewardGoalValid: false,
  };

  return {
    ...initialState,
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    setIsSuccess: (isSuccess: boolean) => set({ isSuccess }),
    setIsConfirmModalOpen: (isConfirmModalOpen: boolean) =>
      set({ isConfirmModalOpen }),
    setError: (error: string) => set({ error }),
    setERC20RewardCondition: (erc20RewardCondition: ERC20RewardCondition) =>
      set({ erc20RewardCondition }),
    setERC721RewardCondition: (erc721RewardCondition: ERC721RewardCondition) =>
      set({ erc721RewardCondition }),
    setERC1155RewardCondition: (
      erc1155RewardCondition: ERC1155RewardCondition,
    ) => set({ erc1155RewardCondition }),
    setERC721RewardOrder: (erc721RewardOrder: ERC721RewardOrder) =>
      set({ erc721RewardOrder }),
    setRewardGoal: (rewardGoal: string) => set({ rewardGoal }),
    setRewardTokenId: (rewardTokenId: string) => set({ rewardTokenId }),
    setPayoutAmount: (payoutAmount: number) => set({ payoutAmount }),
    setPayoutAmounts: (payoutAmounts: number[]) => set({ payoutAmounts }),
    setRewardTokenIds: (rewardTokenIds: string[]) => set({ rewardTokenIds }),
    setAreTokensValid: (areTokensValid: boolean) => set({ areTokensValid }),
    setAreAmountsValid: (areAmountsValid: boolean) => set({ areAmountsValid }),
    setIsRewardGoalValid: (isRewardGoalValid: boolean) =>
      set({ isRewardGoalValid }),
  };
});
