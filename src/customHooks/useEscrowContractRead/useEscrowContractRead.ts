import { useState } from "react";
import { readContract, readContracts } from "wagmi/actions";
import { useEscrowAbi } from "../useContractAbi/useContractAbi";
import { type EscrowType } from "@prisma/client";
import { type Abi } from "viem";
import { formatEther } from "ethers/utils";

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

  const getEscrowVersion = async (): Promise<string> => {
    try {
      const version = (await readContract({
        ...escrowContractConfig,
        functionName: "version",
      })) as string;

      return version;
    } catch (error) {
      setReadContractError(JSON.stringify(error).slice(0, 50));
      return "";
    }
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
  const getERC20EscrowBalance = async (): Promise<string> => {
    try {
      const escrowBalance = (await readContract({
        ...escrowContractConfig,
        functionName: "lookupEscrowBalance",
      })) as bigint;

      const balanceToString = formatEther(escrowBalance);
      return balanceToString;
    } catch (error) {
      setReadContractError(JSON.stringify(error).slice(0, 50));
      return "";
    }
  };

  //ERC721 escrow specific calls
  const getERC721EscrowTokenIds = async (): Promise<string[]> => {
    try {
      const escrowTokenIds = (await readContract({
        ...escrowContractConfig,
        functionName: "getTokenIds",
      })) as bigint[];
      const tokenIdsToString = escrowTokenIds.map((tkn) => tkn.toString());

      return tokenIdsToString;
    } catch (error) {
      setReadContractError(JSON.stringify(error).slice(0, 50));
      return [];
    }
  };

  const getRewardsRelatedEscrowStateVars = async (): Promise<{
    name: string;
    symbol: string;
    address: string;
  } | null> => {
    try {
      const collectionStateVars = (await readContracts({
        contracts: [
          { ...escrowContractConfig, functionName: "collectionName" },
          { ...escrowContractConfig, functionName: "collectionSymbol" },
          {
            ...escrowContractConfig,
            functionName: "collectionAddress",
          },
        ],
      })) as { result: string; status: unknown }[];

      return {
        name: collectionStateVars[0]?.result ?? "",
        symbol: collectionStateVars[1]?.result ?? "",
        address: collectionStateVars[2]?.result ?? "",
      };
    } catch (error) {
      setReadContractError(JSON.stringify(error).slice(0, 50));
      return null;
    }
  };

  //ERC1155 escrow specific calls
  const getERC1155EscrowTokenDetails = async (): Promise<
    | {
        totalTokenIds: number;
        collectionAddress: string;
        tokens: { id: string; value: string }[];
      }
    | undefined
  > => {
    try {
      const escrowDetails = (await readContract({
        ...escrowContractConfig,
        functionName: "getEscrowTokenDetails",
      })) as any[];
      const totalTokenIds = Number(escrowDetails[0]);
      const collectionAddress = escrowDetails[1];
      const tokens = escrowDetails[2];

      return { totalTokenIds, collectionAddress, tokens };
    } catch (error) {
      setReadContractError(JSON.stringify(error).slice(0, 50));
    }
  };

  const lookupERC1155EscrowTokenAmount = async (
    tokenId: string,
  ): Promise<bigint | undefined> => {
    try {
      const amount = (await readContract({
        ...escrowContractConfig,
        functionName: "getEscrowTokenBalance",
        args: [tokenId],
      })) as bigint;
      return amount;
    } catch (error) {
      setReadContractError(JSON.stringify(error).slice(0, 50));
    }
  };

  return {
    getEscrowVersion,
    getEscrowState,
    isSenderApproved,
    isERC20TokenApproved,
    isCollectionApproved,
    getERC20EscrowBalance,
    getERC721EscrowTokenIds,
    getRewardsRelatedEscrowStateVars,
    getERC1155EscrowTokenDetails,
    lookupERC1155EscrowTokenAmount,
    readContractError,
  };
}
