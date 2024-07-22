type UserAddressEventLog = string | `0x${string}`;

export type ObjectiveCompleteEvent = {
  user: UserAddressEventLog;
  objectiveIndex: number;
  timestamp: number;
  totalPoints: number;
};

export type PointsUpdateEvent = {
  user: UserAddressEventLog;
  totalPoints: number;
  amount: number;
  timestamp: number;
};

export type ERC20RewardedEvent = {
  user: UserAddressEventLog;
  amount: bigint;
  rewardedAt: number;
};

export type ERC721RewardedEvent = {
  user: UserAddressEventLog;
  token: number;
  rewardedAt: number;
};

export type ERC1155RewardedEvent = {
  user: UserAddressEventLog;
  token: number;
  amount: number;
  rewardedAt: number;
};
