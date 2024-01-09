import { create } from "zustand";
import {
  ContractSubmissionReqs,
  RewardType,
  Objective,
  Tier,
  Authority,
} from "./types";

type LoyaltyDeployError = {
  step: number;
  message: string;
};

export interface DeployLoyaltyState {
  deployLoyaltyData: {
    chain: string;
    chainId: number;
    hash: string;
    address: string;
    creator: string;
  };
  name: string;
  description: string | null;
  objectives: Objective[];
  authorities: Authority[];
  tiers: Tier[] | null;
  rewardType: RewardType;
  programStart: Date;
  programEndsAt: Date;
  contractRequirements: ContractSubmissionReqs;
  isLoading: boolean;
  isSuccess: boolean;
  errors: LoyaltyDeployError[];
  step: number;
  furthestStep: number;
  setName: (name: string) => void;
  setDescription: (description: string | null) => void;
  setObjectives: (objectives: Objective[]) => void;
  setAuthorities: (authorities: Authority[]) => void;
  setTiers: (tiers: Tier[]) => void;
  setRewardType: (rewardType: RewardType) => void;
  setProgramStart: (start: Date) => void;
  setProgramEnd: (end: Date) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (step: number, error: LoyaltyDeployError) => void;
  setIsSuccess: (isSuccess: boolean) => void;
  setDeployLoyaltyData: (
    chain: string,
    chainId: number,
    hash: string,
    address: string,
    creator: string,
  ) => void;
  setStep: (step: number) => void;
  setFurthestStep: (furthestStep: number) => void;
  reset: () => void;
}

export const useDeployLoyaltyStore = create<DeployLoyaltyState>((set, get) => {
  const programStart: Date = new Date();
  const programEnd: Date = new Date();
  programEnd.setDate(programEnd.getDate() + 30);

  const initialState = {
    deployLoyaltyData: {
      chain: "",
      chainId: 0,
      hash: "",
      address: "",
      creator: "",
    },
    name: "",
    description: "",
    objectives: [],
    authorities: [],
    tiers: [],
    rewardType: RewardType.Points,
    programStart: programStart,
    programEndsAt: programEnd,
    contractRequirements: {
      rewardType: RewardType.Points,
      chain: "mainnet",
      tokenAddress: "",
      minObjectivesRequired: 1,
      maxObjectives: 10,
      tiersActive: false,
      minTiersRequired: 2,
      maxTiers: 8,
      timestamp: Date.now(),
      authorities: [],
      objectives: [],
      tiers: [],
    },
    isLoading: false,
    isSuccess: false,
    errors: [],
    step: 0,
    furthestStep: 0,
  };

  return {
    ...initialState,
    setDeployLoyaltyData: (
      chain: string,
      chainId: number,
      hash: string,
      address: string,
      creator: string,
    ) =>
      set({
        deployLoyaltyData: {
          chain,
          chainId,
          hash,
          address,
          creator,
        },
      }),
    setName: (name: string) => set({ name }),
    setDescription: (description: string | null) => set({ description }),
    setObjectives: (objectives: Objective[]) => set({ objectives }),
    setAuthorities: (authorities: Authority[]) => set({ authorities }),
    setTiers: (tiers: Tier[]) => set({ tiers }),
    setRewardType: (rewardType: RewardType) => set({ rewardType }),
    setProgramStart: (start: Date) => set({ programStart: start }),
    setProgramEnd: (end: Date) => set({ programEndsAt: end }),
    setContractRequirements: (reqs: ContractSubmissionReqs) =>
      set({ contractRequirements: reqs }),

    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    setIsSuccess: (isSuccess: boolean) => set({ isSuccess }),
    setError: (step: number, error: LoyaltyDeployError) => {
      let errorsCopy = [...get().errors];
      errorsCopy = errorsCopy.filter((error) => error.step !== step);
      error.message && errorsCopy.push(error);
      set({ errors: errorsCopy });
    },
    setStep: (step: number) => set({ step }),
    setFurthestStep: (furthestStep: number) => set({ furthestStep }),
    reset: () => set({ ...initialState }),
  };
});
