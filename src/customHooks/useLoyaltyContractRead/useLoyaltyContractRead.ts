import Loyalty from "~/contractsAndAbis/0.03/Loyalty/Loyalty.json";
import { useState } from "react";
import { readContract } from "wagmi/actions";
import { decodeBytes32String } from "ethers";
import { RewardType } from "../useDeployLoyalty/types";

export enum LoyaltyStateReturn {
  Idle,
  AwaitingEscrowSetup,
  Active,
  Completed,
  Canceled,
}

type ReadContractError = {
  isError: boolean;
  message: string;
};

type Bytes32LikeReturn = Uint8Array | string;

type LoyaltySettingsObjective = {
  name: Bytes32LikeReturn;
  authority: Bytes32LikeReturn;
  reward: bigint;
};
type FormattedLoyaltySettingsReturn = {
  tiersActive: boolean;
  tiersCount: number;
  totalPointsPossible: string;
  rewardType: string;
  objectives: FormattedContractObjective[];
};
type FormattedContractObjective = {
  name: string;
  reward: string;
  authority: string;
};
type FormattedProgramDetails = {
  name: string;
  creator: string | `0x${string}`;
  programStart: Date;
  programEnd: Date;
};

export function useLoyaltyContractRead(loyaltyAddress: string) {
  const [readContractError, setReadContractError] = useState<ReadContractError>(
    { isError: false, message: "" },
  );
  const loyaltyContractConfig = {
    address: loyaltyAddress as `0x${string}`,
    abi: Loyalty.abi,
  };

  const getContractVersion = async (): Promise<string> => {
    try {
      const loyaltyContractVersion = (await readContract({
        ...loyaltyContractConfig,
        functionName: "version",
      })) as string;
      return loyaltyContractVersion;
    } catch (error) {
      setError(error);
      return "";
    }
  };

  const getContractState = async (): Promise<string | undefined> => {
    try {
      const loyaltyContractState = (await readContract({
        ...loyaltyContractConfig,
        functionName: "state",
      })) as number;
      if (loyaltyContractState in LoyaltyStateReturn) {
        const formattedState = LoyaltyStateReturn[loyaltyContractState];
        return formattedState;
      } else return undefined;
    } catch (error) {
      setError(error);
    }
  };

  const getProgramDetails =
    async (): Promise<FormattedProgramDetails | null> => {
      //TODO - this is temporary as I may change the getter func for this in contract
      try {
        const details = (await readContract({
          ...loyaltyContractConfig,
          functionName: "getBasicLoyaltyProgramDetails",
        })) as unknown[];

        if (
          details.length > 0 &&
          typeof details[0] === "string" &&
          typeof details[1] === "string" &&
          typeof details[2] === "boolean" &&
          typeof details[3] === "boolean" &&
          typeof details[4] === "bigint" &&
          typeof details[5] === "bigint" &&
          typeof details[6] === "number"
        ) {
          const name = details[0];
          const creator = details[1];
          const programStart = new Date(Number(details[4]) * 1000);
          const programEnd = new Date(Number(details[5]) * 1000);
          return { name, creator, programStart, programEnd };
        } else {
          throw new Error("Unexpected contract return");
        }
      } catch (error) {
        setError(error);
        return null;
      }
    };

  const getLoyaltyProgramSettings =
    async (): Promise<FormattedLoyaltySettingsReturn | null> => {
      try {
        const loyaltyProgramSettings = (await readContract({
          ...loyaltyContractConfig,
          functionName: "getLoyaltyProgramSettings",
        })) as unknown[];

        if (
          loyaltyProgramSettings.length === 5 &&
          typeof loyaltyProgramSettings[0] === "boolean" &&
          typeof loyaltyProgramSettings[1] === "bigint" &&
          typeof loyaltyProgramSettings[2] === "bigint" &&
          typeof loyaltyProgramSettings[3] === "number" &&
          Array.isArray(loyaltyProgramSettings[4])
        ) {
          const [
            tiersActive,
            tiersCount,
            totalPointsPossible,
            rewardType,
            objectives,
          ] = loyaltyProgramSettings;

          const isValidObjectivesArray = objectives.every((obj: unknown) =>
            isLoyaltyContractObjective(obj),
          );

          if (isValidObjectivesArray && rewardType in RewardType) {
            const objectivesBytesToString = convertObjectivesBytesToString(
              objectives as LoyaltySettingsObjective[],
            );

            return {
              tiersActive,
              tiersCount: Number(tiersCount),
              totalPointsPossible: totalPointsPossible.toString(),
              rewardType: RewardType[rewardType] ?? "",
              objectives: objectivesBytesToString,
            };
          } else {
            throw new Error("Unexpected objectives or reward type");
          }
        } else {
          throw new Error("Unexpected return for loyalty program settings");
        }
      } catch (error) {
        setError(error);
        return null;
      }
    };

  const getObjectivesOnly = async (): Promise<FormattedContractObjective[]> => {
    try {
      const objectives = await readContract({
        ...loyaltyContractConfig,
        functionName: "getObjectives",
      });

      if (Array.isArray(objectives) && objectives.length > 0) {
        const formattedObjectives = convertObjectivesBytesToString(
          objectives as LoyaltySettingsObjective[],
        );
        return formattedObjectives;
      } else return [];
    } catch (error) {
      setError(error);
      return [];
    }
  };

  const getTotalPointsPossible = async (): Promise<number | undefined> => {
    try {
      const totalPointsPossible = (await readContract({
        ...loyaltyContractConfig,
        functionName: "totalPointsPossible",
      })) as bigint;
      const totalPointsToNum = Number(totalPointsPossible);
      return totalPointsToNum;
    } catch (error) {
      setError(error);
    }
  };

  const convertObjectivesBytesToString = (
    objectives: LoyaltySettingsObjective[],
  ): FormattedContractObjective[] => {
    const formattedObjectives = objectives.map(
      (obj: LoyaltySettingsObjective) => ({
        name: decodeBytes32String(obj.name),
        reward: obj.reward.toString(),
        authority: decodeBytes32String(obj.authority),
      }),
    );
    return formattedObjectives;
  };

  const isLoyaltyContractObjective = (
    obj: unknown,
  ): obj is LoyaltySettingsObjective => {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "name" in obj &&
      "authority" in obj &&
      "reward" in obj
    );
  };

  const setError = (error: any, message?: string): void => {
    //TODO error handle better
    setReadContractError({
      isError: true,
      message: message ?? "Error fetching data from contract",
    });
  };

  return {
    getContractVersion,
    getContractState,
    getProgramDetails,
    getLoyaltyProgramSettings,
    getObjectivesOnly,
    getTotalPointsPossible,
    readContractError,
  };
}
