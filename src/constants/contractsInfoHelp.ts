import {
  ERC20RewardCondition,
  ERC721RewardCondition,
  ERC721RewardOrder,
  ERC1155RewardCondition,
} from "~/customHooks/useEscrowSettings/types";

export type ERC20RewardConditionDescriptor = {
  erc20RewardCondition: ERC20RewardCondition;
  info: string;
};

export type ERC721RewardConditionDescriptor = {
  erc721RewardCondition: ERC721RewardCondition;
  info: string;
};

export type ERC721RewardOrderDescriptor = {
  erc721RewardOrder: ERC721RewardOrder;
  info: string;
};

export type ERC1155RewardConditionDescriptor = {
  erc1155RewardCondition: ERC1155RewardCondition;
  info: string;
};

export const erc20RewardConditionDescriptors: ERC20RewardConditionDescriptor[] =
  [
    {
      erc20RewardCondition: ERC20RewardCondition.NotSet,
      info: "Select a reward condition to learn more",
    },
    {
      erc20RewardCondition: ERC20RewardCondition.AllObjectivesComplete,
      info: "Reward tokens to a user only once the user has completed every single loyalty program objective",
    },
    {
      erc20RewardCondition: ERC20RewardCondition.SingleObjective,
      info: "Allows you to specify a single objective that will reward tokens once the objective is completed by a user",
    },
    {
      erc20RewardCondition: ERC20RewardCondition.AllTiersComplete,
      info: "Reward tokens once a user has reached the very last tier",
    },
    {
      erc20RewardCondition: ERC20RewardCondition.SingleTier,
      info: "Reward tokens once a specified tier is reached by the user",
    },
    {
      erc20RewardCondition: ERC20RewardCondition.PointsTotal,
      info: "Reward tokens once a specified points total is reached by user",
    },
    {
      erc20RewardCondition: ERC20RewardCondition.RewardPerObjective,
      info: "Reward tokens for each objective completed by the user",
    },
    {
      erc20RewardCondition: ERC20RewardCondition.RewardPerTier,
      info: "Reward tokens for each tier reached and passed by the user",
    },
  ];

export const erc721RewardConditionDescriptors: ERC721RewardConditionDescriptor[] =
  [
    {
      erc721RewardCondition: ERC721RewardCondition.NotSet,
      info: "Select a reward condition to learn more",
    },
    {
      erc721RewardCondition: ERC721RewardCondition.ObjectiveCompleted,
      info: "Reward a token for a specified objective that is completed",
    },
    {
      erc721RewardCondition: ERC721RewardCondition.TierReached,
      info: "Reward a token once a user has reached a specified tier",
    },
    {
      erc721RewardCondition: ERC721RewardCondition.PointsTotal,
      info: "Reward a token once a specified points total is reached by the user",
    },
  ];

export const erc721RewardOrderDescriptors: ERC721RewardOrderDescriptor[] = [
  {
    erc721RewardOrder: ERC721RewardOrder.NotSet,
    info: "Select a reward order to learn more",
  },
  {
    erc721RewardOrder: ERC721RewardOrder.Ascending,
    info: "As various users complete objectives and tiers, the lowest token IDs in escrow will be rewarded first",
  },
  {
    erc721RewardOrder: ERC721RewardOrder.Descending,
    info: "As various users complete objectives and tiers, the highest token IDs in escrow will be rewarded first",
  },
  {
    erc721RewardOrder: ERC721RewardOrder.Random,
    info: "As various users complete objectives and tiers, tokens will be be awarded in a random order",
  },
];

export const erc1155RewardConditionDescriptors: ERC1155RewardConditionDescriptor[] =
  [
    {
      erc1155RewardCondition: ERC1155RewardCondition.NotSet,
      info: "Select a reward condition to learn more",
    },
    {
      erc1155RewardCondition: ERC1155RewardCondition.EachObjective,
      info: "Reward tokens for each objective completed by a user",
    },
    {
      erc1155RewardCondition: ERC1155RewardCondition.SingleObjective,
      info: "Specify a single objective that will reward tokens once completed by a user",
    },
    {
      erc1155RewardCondition: ERC1155RewardCondition.EachTier,
      info: "Reward tokens for each tier reached and passed by a user",
    },
    {
      erc1155RewardCondition: ERC1155RewardCondition.SingleTier,
      info: "Specify a single tier that will reward tokens once reached by a user",
    },
    {
      erc1155RewardCondition: ERC1155RewardCondition.PointsTotal,
      info: "Specify a points total that will reward tokens once reached by a user",
    },
  ];
