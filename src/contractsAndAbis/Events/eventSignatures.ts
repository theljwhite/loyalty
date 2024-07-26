import { keccak256, toUtf8Bytes } from "ethers";

export const POINTS_UPDATE_STR =
  "PointsUpdate(address,uint256,uint256,uint256)";
export const OBJ_COMPLETE_STR =
  "ObjectiveCompleted(address,uint256,uint256,uint256)";
export const ERC20_REWARDED_STR = "ERC20Rewarded(address,uint256,uint256)";
export const ERC721_REWARDED_STR = "ERC721Rewarded(address,uint256,uint256";
export const ERC1155_REWARDED_STR =
  "ERC1155Rewarded(address,uint256,uint256,uint256)";

export const POINTS_UPDATE_SIG = keccak256(toUtf8Bytes(POINTS_UPDATE_STR));
export const OBJ_COMPLETE_SIG = keccak256(toUtf8Bytes(OBJ_COMPLETE_STR));

export const ERC20_REWARDED_SIG = keccak256(toUtf8Bytes(ERC20_REWARDED_STR));
export const ERC721_REWARDED_SIG = keccak256(toUtf8Bytes(ERC721_REWARDED_STR));
export const ERC1155_REWARDED_SIG = keccak256(
  toUtf8Bytes(ERC1155_REWARDED_STR),
);
