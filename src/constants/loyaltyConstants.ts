export const MAX_LOYALTY_NAME_LENGTH = 32;
export const MAX_LOYALTY_DESC_LENGTH = 120;
export const MAX_OBJECTIVES_LENGTH = 10;
export const MAX_TIERS_LENGTH = 8;
export const MIN_TIERS_LENGTH = 2;

export const MAX_OBJECTIVE_TITLE_LENGTH = 120;
export const MIN_OBJECTIVE_TITLE_LENGTH = 3;
export const MAX_OBJECTIVE_POINTS_VALUE = 10_000;
export const MIN_OBJECTIVE_POINTS_VALUE = 1;

export const MIN_TIER_POINTS_REQ_VALUE = 1;
export const MAX_TIER_POINTS_REQ_VALUE =
  MAX_OBJECTIVES_LENGTH * MAX_OBJECTIVE_POINTS_VALUE;
export const MIN_TIER_NAME_LENGTH = 1;
export const MAX_TIER_NAME_LENGTH = 30;

export const MAX_DIFF_TOKEN_IDS_ERC1155 = 5;
export const ERC20_PAYOUT_BUFFER = 5;
export const ERC1155_PAYOUT_BUFFER = 4;

export enum EscrowStateToSolidityEnum {
  Idle = 0,
  DepositPeriod = 1,
  AwaitingEscrowSettings = 2,
  InIssuance = 3,
  Completed = 4,
  Frozen = 5,
  Canceled = 6,
}
