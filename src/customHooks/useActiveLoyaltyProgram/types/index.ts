import type { RewardType } from "@prisma/client";

//NOTE: these types are a work in progress as user completion data and storage...
//...is still up in the air in terms of how it will be handeled in this NextJS app...
//...since the smart contracts will store some of this information by themselves;

export type UserCompletionInfo = {
  loyaltyProgramId: string;
  loyaltyProgramAddress: string;
  objectives: UserObjective[];
  userAddress?: string;
  userId: string;
};

export type UserObjective = {
  isCompleted: boolean;
  completedAt: Date;
  pointsEarned: number;
  rewardInfo: CompletedObjectiveRewardInfo;
};

export type CompletedObjectiveRewardInfo = {
  rewardedAt: Date;
  rewardType: RewardType;
  tokenId: number;
  tokenAmount?: number;
};

//....ETC
