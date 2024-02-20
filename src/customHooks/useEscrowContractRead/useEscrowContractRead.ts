import { useState } from "react";
import { readContract } from "wagmi/actions";
import { useEscrowAbi } from "../useContractAbi/useContractAbi";
import { type EscrowType } from "@prisma/client";
import { type Abi } from "viem";

export enum EscrowStateReturn {
  Idle,
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
  const { abi: latestAbi } = useEscrowAbi(escrowType);
  const { abi: abiVersion0_01 } = useEscrowAbi(escrowType, "0.01");

  const escrowContractConfig = {
    address: escrowAddress as `0x${string}`,
    abi: latestAbi as Abi,
  };
  const escrowContract0_01Config = {
    address: escrowAddress as `0x${string}`,
    abi: abiVersion0_01 as Abi,
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
        ...escrowContract0_01Config,
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
        ...escrowContract0_01Config,
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
        ...escrowContract0_01Config,
        functionName: "isCollectionApproved",
        args: [collectionAddress],
      })) as boolean;
      return isApproved;
    } catch (error) {
      setReadContractError(JSON.stringify(error).slice(0, 50));
      return false;
    }
  };

  //ERC20 escrow specific calls
  const getERC20EscrowBalance = async (): Promise<number> => {
    try {
      const escrowBalance = (await readContract({
        ...escrowContractConfig,
        functionName: "lookupEscrowBalance",
      })) as number;

      return escrowBalance;
    } catch (error) {
      setReadContractError(JSON.stringify(error).slice(0, 50));
      return 0;
    }
  };

  //ERC721 escrow specific calls - TODO

  //ERC1155 escrow specific calls - TODO

  return {
    getEscrowState,
    isSenderApproved,
    isERC20TokenApproved,
    isCollectionApproved,
    getERC20EscrowBalance,
    readContractError,
  };
}
