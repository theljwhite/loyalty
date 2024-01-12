import {
  MAX_LOYALTY_NAME_LENGTH,
  MAX_OBJECTIVES_LENGTH,
  MAX_OBJECTIVE_POINTS_VALUE,
  MAX_OBJECTIVE_TITLE_LENGTH,
  MAX_TIERS_LENGTH,
  MIN_OBJECTIVE_POINTS_VALUE,
  MIN_OBJECTIVE_TITLE_LENGTH,
} from "~/constants/loyaltyConstants";
import { LEADING_ZERO_REGEX } from "~/constants/regularExpressions";
import { Authority, Objective } from "~/customHooks/useDeployLoyalty/types";

export type StateKey =
  | "name"
  | "description"
  | "objectives_input"
  | "objectives"
  | "tiers"
  | "rewardType";

const validateName = (name: string): string => {
  if (name.length < 3) return "Name must have at least 3 characters";
  if (name.length >= MAX_LOYALTY_NAME_LENGTH) {
    return "Name cannot be larger than 32 characters";
  }
  return "";
};

const validateDescription = (desc: string): string => {
  if (desc.length > 80) return "Description is too long";
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
const validateTiers = (): string => {
  //TODO
  return "";
};
const validateRewardType = (): string => {
  //TODO
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
    return "Objective title cannot exceed 120 characters";
  }

  if (title.length < MIN_OBJECTIVE_TITLE_LENGTH) {
    return "Objective title must exceed 3 characters";
  }

  if (authority !== "CREATOR" && authority !== "USER") {
    return "Invalid authority type";
  }

  if (points > MAX_OBJECTIVE_POINTS_VALUE) {
    return "Can not award more than 10,000 points for a single objective";
  }

  if (points < MIN_OBJECTIVE_POINTS_VALUE) {
    return "Must award a points value of at least 1";
  }
  if (LEADING_ZERO_REGEX.test(String(points))) {
    return "Amount of points cannot start with a 0";
  }

  return "";
};
