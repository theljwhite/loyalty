import { useState } from "react";
import { readContract } from "wagmi/actions";
import { useContractFactoryParams } from "../useContractFactoryParams/useContractFactoryParams";
import { type EscrowType } from "@prisma/client";
import { type Abi } from "viem";

export enum EscrowStateReturn {
  Idle,
  AwaitingEscrowApprovals,
  DepositPeriod,
  AwaitingEscrowSettings,
  InIssuance,
  Completed,
  Frozen,
  Canceled,
}

export function useEscrowContractRead(
  escrowAddress: string,
  escrowType: EscrowType,
) {
  const [readContractError, setReadContractError] = useState<string>("");
  const { abi } = useContractFactoryParams(escrowType);
  const escrowContractConfig = {
    address: escrowAddress as `0x${string}`,
    abi: abi as Abi,
  };

  const getEscrowState = async (): Promise<string | undefined> => {
    try {
      const escrowContractState = (await readContract({
        ...escrowContractConfig,
        functionName: "escrowState",
      })) as number;
      if (escrowContractState in EscrowStateReturn) {
        const formattedState = EscrowStateReturn[escrowContractState];
        return formattedState;
      } else return undefined;
    } catch (error) {
      setReadContractError(JSON.stringify(error).slice(0, 50));
    }
  };

  const isSenderApproved = async (senderAddress: string): Promise<boolean> => {
    try {
      const isApproved = (await readContract({
        ...escrowContractConfig,
        functionName: "isSenderApproved",
        args: [senderAddress],
      })) as boolean;

      return isApproved;
    } catch (error) {
      setReadContractError(JSON.stringify(error).slice(0, 50));
      return false;
    }
  };

  const isERC20TokenApproved = async (
    tokenAddress: string,
  ): Promise<boolean> => {
    try {
      const isTokenApproved = (await readContract({
        ...escrowContractConfig,
        functionName: "isTokenApproved",
        args: [tokenAddress],
      })) as boolean;

      return isTokenApproved;
    } catch (error) {
      setReadContractError(JSON.stringify(error).slice(0, 50));
      return false;
    }
  };

  const isCollectionApproved = async (
    collectionAddress: string,
  ): Promise<boolean> => {
    try {
      const isApproved = (await readContract({
        ...escrowContractConfig,
        functionName: "isCollectionApproved",
        args: [collectionAddress],
      })) as boolean;
      return isApproved;
    } catch (error) {
      setReadContractError(JSON.stringify(error).slice(0, 50));
      return false;
    }
  };

  return {
    getEscrowState,
    isSenderApproved,
    isERC20TokenApproved,
    isCollectionApproved,
    readContractError,
  };
}
