import {
  MAX_LOYALTY_NAME_LENGTH,
  MAX_LOYALTY_DESC_LENGTH,
  MAX_OBJECTIVES_LENGTH,
  MAX_OBJECTIVE_POINTS_VALUE,
  MAX_OBJECTIVE_TITLE_LENGTH,
  MAX_TIERS_LENGTH,
  MIN_OBJECTIVE_POINTS_VALUE,
  MIN_OBJECTIVE_TITLE_LENGTH,
  MIN_TIER_POINTS_REQ_VALUE,
  MAX_TIER_POINTS_REQ_VALUE,
  MIN_TIER_NAME_LENGTH,
  MAX_TIER_NAME_LENGTH,
  MIN_TIERS_LENGTH,
} from "~/constants/loyaltyConstants";
import { LEADING_ZERO_REGEX } from "~/constants/regularExpressions";
import {
  Authority,
  Objective,
  RewardType,
  Tier,
} from "~/customHooks/useDeployLoyalty/types";

export type StateKey =
  | "name"
  | "description"
  | "objectives_input"
  | "objectives"
  | "tiers"
  | "rewardType"
  | "programEndsAt";

const validateName = (name: string): string => {
  if (name.length < 3) return "Name must have at least 3 characters";
  if (name.length >= MAX_LOYALTY_NAME_LENGTH) {
    return `Name must be less than ${MAX_LOYALTY_NAME_LENGTH} characters`;
  }
  return "";
};

const validateDescription = (desc: string): string => {
  if (desc.length > MAX_LOYALTY_DESC_LENGTH) return "Description is too long";
  return "";
};

const validateObjectives = (objectives: Objective[]): string => {
  if (objectives.length > MAX_OBJECTIVES_LENGTH) {
    return "Max objectives length exceeded";
  }
  const objectiveTitles = objectives.map((obj) => obj.title);
  const isDuplicateTitle = objectiveTitles.some(
    (obj, index) => objectiveTitles.indexOf(obj) != index,
  );

  if (isDuplicateTitle) return "Objectives cannot have the same exact titles";

  return "";
};
const validateTiers = (tiers: Tier[]): string => {
  if (tiers.length < MIN_TIERS_LENGTH) {
    return `Add more tiers. Must have at least ${MIN_TIERS_LENGTH} tiers`;
  }

  if (tiers.length > MAX_TIERS_LENGTH) {
    return `Max tiers exceeded. You can only add ${MAX_TIERS_LENGTH} tiers`;
  }

  const areTierPointsAscending = tiers
    .slice(1)
    .every(
      (tier, index) => tier.rewardsRequired > tiers[index]!.rewardsRequired,
    );

  if (!areTierPointsAscending) {
    return "Tier points required values must be in ascending order.";
  }

  return "";
};

const validateRewardType = (rewardType: RewardType): string => {
  if (rewardType in RewardType) return "";
  else return "Not a valid reward type";
};

const validateProgramEndDate = (programEndsAt: Date): string => {
  const currentDate = new Date();
  const oneDayInMs = 86_400_000;
  const minAllowedEndDate = new Date(currentDate.getTime() + oneDayInMs);

  if (programEndsAt < minAllowedEndDate) {
    return "Program end date must be at least 1 day in the future";
  }

  return "";
};

export const validationFuncs = new Map<
  number,
  { validation: (...args: any[]) => string; stateKey: StateKey[] }[]
>([
  [
    0,
    [
      { validation: validateName, stateKey: ["name"] },
      { validation: validateDescription, stateKey: ["description"] },
    ],
  ],

  [1, [{ validation: validateObjectives, stateKey: ["objectives"] }]],
  [2, [{ validation: validateTiers, stateKey: ["tiers"] }]],
  [3, [{ validation: validateRewardType, stateKey: ["rewardType"] }]],
  [4, [{ validation: validateProgramEndDate, stateKey: ["programEndsAt"] }]],
]);

export const validateStep = (step: number, state: any): string | null => {
  const funcsForValidation = validationFuncs.get(step);
  if (!funcsForValidation) return null;

  for (const func of funcsForValidation) {
    const { validation, stateKey } = func;
    const stateValues = stateKey.map((key) => state[key as StateKey]);
    const errorMessage = validation(...stateValues);

    if (errorMessage) return errorMessage;
  }

  return "";
};

export const validateObjectiveInputs = (
  title: string,
  authority: Authority,
  points: number,
): string => {
  if (!title.trim().length) {
    return "Objective title cannot contain empty space";
  }
  if (title.length >= MAX_OBJECTIVE_TITLE_LENGTH) {
    return `Objective title cannot exceed ${MAX_OBJECTIVE_TITLE_LENGTH} characters`;
  }

  if (title.length < MIN_OBJECTIVE_TITLE_LENGTH) {
    return `Objective title must exceed ${MIN_OBJECTIVE_TITLE_LENGTH} characters`;
  }

  if (authority !== "CREATOR" && authority !== "USER") {
    return "Invalid authority type";
  }

  if (points > MAX_OBJECTIVE_POINTS_VALUE) {
    return `Can not award more than ${MAX_OBJECTIVE_POINTS_VALUE} points for a single objective`;
  }

  if (points < MIN_OBJECTIVE_POINTS_VALUE) {
    return `Must award a points value of at least ${MIN_OBJECTIVE_POINTS_VALUE}`;
  }
  if (LEADING_ZERO_REGEX.test(String(points))) {
    return "Amount of points cannot start with a 0";
  }

  return "";
};

export const validateTierInputs = (
  maxReachablePoints: number,
  tierName: string,
  pointsRequired: number,
): string => {
  if (tierName.length < MIN_TIER_NAME_LENGTH) {
    return `Tier name must must be greater than ${MIN_TIER_NAME_LENGTH} characters`;
  }

  if (tierName.length > MAX_TIER_NAME_LENGTH) {
    return `Tier name cannot exceed ${MAX_TIER_NAME_LENGTH} characters`;
  }

  if (pointsRequired < MIN_TIER_POINTS_REQ_VALUE) {
    return `Must set points required to at least ${MIN_TIER_POINTS_REQ_VALUE} point`;
  }
  if (pointsRequired > MAX_TIER_POINTS_REQ_VALUE) {
    return "Max points required value exceeded";
  }
  if (pointsRequired > maxReachablePoints) {
    return `Tier points required cannot exceed max reachable points of ${maxReachablePoints}`;
  }

  return "";
};
