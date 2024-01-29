import { useState } from "react";
import { readContract } from "wagmi/actions";
import Loyalty from "~/contractsAndAbis/Loyalty/Loyalty.json";

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

  const getLoyaltyProgramSettings = async (): Promise<void> => {
    try {
      const loyaltyProgramSettings = await readContract({
        ...loyaltyContractConfig,
        functionName: "getLoyaltyProgramSettings",
      });
      const [
        tiersActive,
        tiersCount,
        totalPointsPossible,
        rewardType,
        objectives,
      ] = loyaltyProgramSettings as Array<any>;
      //TODO finish this
    } catch (error) {}
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
    getLoyaltyProgramSettings,
    readContractError,
  };
}
