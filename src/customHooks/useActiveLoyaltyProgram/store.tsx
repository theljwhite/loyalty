import { create } from "zustand";
import { type Objective, type Tier, RewardType } from "@prisma/client";
import { UserCompletionInfo } from "./types";

//TODO - finish this

export interface ActiveLoyaltyProgramState {
  name: string;
  address: string;
  description: string;
  objectives: Objective[];
  tiers: Tier[];
  rewardType: RewardType;
  escrowAddress: string;
  userCompletion: UserCompletionInfo[];
}

export const useActiveLoyaltyProgramStore = create<ActiveLoyaltyProgramState>(
  (set) => {
    const initialState = {
      name: "",
      address: "",
      description: "",
      objectives: [],
      tiers: [],
      rewardType: RewardType.Points,
      escrowAddress: "",
      userCompletion: [],
    };

    return {
      ...initialState,

      setName: (name: string) => set({ name }),
      setDescription: (description: string) => set({ description }),
      setObjectives: (objectives: Objective[]) => set({ objectives }),
      setTiers: (tiers: Tier[]) => set({ tiers }),
      setRewardType: (rewardType: RewardType) => set({ rewardType }),
      setEscrowAddress: (escrowAddress: string) => set({ escrowAddress }),
      setUserCompletion: (userCompletion: UserCompletionInfo[]) =>
        set({ userCompletion }),
    };
  },
);
