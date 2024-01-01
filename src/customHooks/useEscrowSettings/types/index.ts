export enum ERC20RewardCondition {
  NotSet,
  AllObjectivesComplete,
  SingleObjective,
  AllTiersComplete,
  SingleTier,
  PointsTotal,
  RewardPerObjective,
  RewardPerTier,
}
export enum ERC1155RewardCondition {
  NotSet,
  EachObjective,
  SingleObjective,
  EachTier,
  SingleTier,
  PointsTotal,
}
export enum ERC721RewardCondition {
  NotSet,
  ObjectiveCompleted,
  TierReached,
  PointsTotal,
}
export enum ERC721RewardOrder {
  NotSet,
  Ascending,
  Descending,
  Random,
}

export type ERC20EscrowSettingsBasicReqs = {
  rewardCondition: ERC20RewardCondition;
  rewardGoal: number;
};
export type ERC20EscrowSettingsAdvancedReqs = {
  rewardCondition: ERC20RewardCondition;
  payouts: number[];
};

export type ERC721EscrowSettingsReqs = {
  rewardOrder: ERC721RewardOrder;
  rewardCondition: ERC721RewardCondition;
  rewardGoal: number;
};

export type ERC1155EscrowSettingsBasicReqs = {
  rewardCondition: ERC1155RewardCondition;
  tokenId: number;
  payoutAmount: number;
  rewardGoal: number;
};

export type ERC1155EscrowSettingsAdvancedReqs = {
  rewardCondition: ERC1155RewardCondition;
  tokenIds: number[];
  payoutAmounts: number[];
};
