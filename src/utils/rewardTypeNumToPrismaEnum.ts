import { RewardType } from "@prisma/client";

//TODO - temp fix until prisma RewardType type hamdling is decided on
//from front end, solidity represents enums as uint 8's so the rewardTypes...
//...need to be in that format to pass tos smart contracts...
//... But frontend rewardType values (numbers) arent...
//...compatible with Prisma generated RewardType type

export const rewardTypeNumToPrismaEnum = (
  rewardTypeNum: number,
): RewardType => {
  let rewardType: RewardType = RewardType.Points;
  switch (rewardTypeNum) {
    case 0:
      rewardType = RewardType.Points;
      break;
    case 1:
      rewardType = RewardType.ERC20;
      break;
    case 2:
      rewardType = RewardType.ERC721;
      break;
    case 3:
      rewardType = RewardType.ERC1155;
    default:
      break;
  }
  return rewardType;
};
