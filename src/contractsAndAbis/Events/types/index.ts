import { type Authority } from "@prisma/client";
import { type ERC20RewardCondition } from "~/customHooks/useEscrowSettings/types";

type UserAddressEventLog = string | `0x${string}`;

export type ObjectiveCompleteEvent = {
  user: UserAddressEventLog;
  objectiveIndex: number;
  completedAt: Date;
  totalPoints: number;
};

export type PointsUpdateEvent = {
  user: UserAddressEventLog;
  totalPoints: number;
  amount: number;
  updatedAt: Date;
};

export type ERC20RewardedEvent = {
  user: UserAddressEventLog;
  amount: number; //this may need to be bigint
  rewardCondition: ERC20RewardCondition;
  rewardedAt: Date;
};

export type ERC721RewardedEvent = {
  user: UserAddressEventLog;
  token: number;
  rewardedAt: Date;
};

export type ERC1155RewardedEvent = {
  user: UserAddressEventLog;
  token: number;
  amount: number;
  rewardedAt: Date;
};
