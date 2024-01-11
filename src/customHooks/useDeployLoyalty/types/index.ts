export type Authority = "USER" | "CREATOR";
export enum RewardType {
  Points,
  ERC20,
  ERC721,
  ERC1155,
}

export type Objective = {
  id: number;
  title: string;
  reward: number;
  authority: Authority;
};
export type Tier = {
  index: number;
  rewardsRequired: number;
};

export type ContractSubmissionReqs = {
  rewardType: RewardType;
  chain: string;
  tokenAddress: string | null;
  minObjectivesRequired: number;
  maxObjectives: number;
  tiersActive: boolean;
  minTiersRequired: number;
  maxTiers: number;
  timestamp: number;
  authorities: Authority[];
  objectives: Objective[];
  tiers: Tier[] | null;
};
