import {
  writeContract,
  readContract,
  readContracts,
  waitForTransaction,
  fetchToken,
} from "wagmi/actions";
import { erc721ABI, useNetwork } from "wagmi";
import { supportsInterfaceAbi } from "~/contractsAndAbis/ERC721Utilities/supportsInterfaceAbi";
import { useEscrowApprovalsStore } from "./store";
import { useContractFactoryParams } from "~/customHooks/useContractFactoryParams/useContractFactoryParams";
import { useError } from "~/customHooks/useError";
import { encodeBytes32String, hexlify } from "ethers";

export function useEscrowApprovals() {
  const { chain } = useNetwork();
  const {
    escrowType,
    rewardAddress,
    senderAddress,
    depositPeriodEndsAt,
    setRewardInfo,
    setIsSenderApproved,
    setIsRewardAddressApproved,
    setIsSuccess,
    setIsLoading,
    setError,
  } = useEscrowApprovalsStore((state) => state);
  const { abi } = useContractFactoryParams(escrowType);
  const { error, handleErrorFlow } = useError();

  const approveRewards = async (escrowAddress: string): Promise<void> => {
    setIsLoading(true);
    const isApproved = true;
    const contractConfig = {
      address: escrowAddress as `0x${string}`,
      abi,
    };
    try {
      if (escrowType === "ERC20" && (await isERC20Verified())) {
        const approveRewards = await writeContract({
          ...contractConfig,
          functionName: "approveToken",
          args: [rewardAddress, isApproved],
        });

        const receipt = await waitForTransaction({
          chainId: chain?.id,
          hash: approveRewards.hash,
        });

        if (receipt.status == "success") {
          setIsRewardAddressApproved(true);
          setIsSuccess(true);
          setIsLoading(false);
        }
      }
      if (escrowType === "ERC721" || escrowType === "ERC1155") {
        const isVerified: boolean =
          escrowType === "ERC721"
            ? await isERC721Verified()
            : await isERC1155Verified();

        if (isVerified) {
          const approveCollection = await writeContract({
            ...contractConfig,
            functionName: "approveCollection",
            args: [rewardAddress, isApproved],
          });
          const receipt = await waitForTransaction({
            chainId: chain?.id,
            hash: approveCollection.hash,
          });
          if (receipt.status == "success") {
            setIsRewardAddressApproved(true);
            setIsSuccess(true);
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
          setError("Could not approve collection");
        }
      }
    } catch (e) {
      setIsLoading(false);
      setError(error);
      handleErrorFlow(e, "Rewards approval failed");
    }
  };

  const approveSender = async (escrowAddress: string): Promise<boolean> => {
    setIsLoading(true);
    const contractConfig = {
      address: escrowAddress as `0x${string}`,
      abi,
    };
    const isApproved = true;
    try {
      const approveSender = await writeContract({
        ...contractConfig,
        functionName: "approveSender",
        args: [senderAddress, isApproved],
      });
      const receipt = await waitForTransaction({
        chainId: chain?.id,
        hash: approveSender.hash,
      });

      if (receipt.status == "success") {
        setIsLoading(false);
        setIsSuccess(true);
        setIsSenderApproved(true);
        return true;
      }
    } catch (e) {
      handleErrorFlow(e, "Sender could not be approved");
      setIsLoading(false);
      setError(error);
      return false;
    }
    return false;
  };

  const setDepositKey = async (
    key: string,
    escrowAddress: string,
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const keyBytes32 = encodeBytes32String(key);
      const depositEndsAt: number = Date.parse(`${depositPeriodEndsAt}`) / 1000;
      const contractConfig = {
        address: escrowAddress as `0x${string}`,
        abi,
      };
      const setDepositKey = await writeContract({
        ...contractConfig,
        functionName: "setDepositKey",
        args: [keyBytes32, depositEndsAt],
      });
      const receipt = await waitForTransaction({
        chainId: chain?.id,
        hash: setDepositKey.hash,
      });

      if (receipt.status == "success") {
        setIsLoading(false);
        setIsSuccess(true);
      }
    } catch (e) {
      console.log("e", e);
      handleErrorFlow(e, "Setting deposit key failed");
      setIsLoading(false);
      setError(error);
    }
  };

  const isERC20Verified = async (): Promise<boolean> => {
    try {
      const tokenData = await fetchToken({
        address: rewardAddress as `0x${string}`,
      });
      if (tokenData == null) return false;
      else {
        setRewardInfo({
          name: tokenData.name,
          symbol: tokenData.symbol,
          decimals: tokenData.decimals,
        });
        return true;
      }
    } catch (e) {
      handleErrorFlow(e, "Contract could not be verified as ERC20");
      return false;
    }
  };

  const isERC721Verified = async (): Promise<boolean> => {
    try {
      const ERC165InterfaceIdBytes = hexlify("0x01ffc9a7");
      const supportsInterface = await readContract({
        address: rewardAddress as `0x${string}`,
        abi: supportsInterfaceAbi,
        functionName: "supportsInterface",
        args: [ERC165InterfaceIdBytes],
      });

      if (supportsInterface) {
        const rewardsContract = {
          address: rewardAddress as `0x${string}`,
          abi: erc721ABI,
        };
        const contractData = await readContracts({
          contracts: [
            { ...rewardsContract, functionName: "name" },
            { ...rewardsContract, functionName: "symbol" },
          ],
        });

        if (
          contractData[0].status == "success" &&
          contractData[1].status == "success"
        ) {
          setRewardInfo({
            name: contractData[0].result,
            symbol: contractData[1].result,
            decimals: null,
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      handleVerificationErrors(error);
      return false;
    }
  };

  const isERC1155Verified = async (): Promise<boolean> => {
    try {
      const ERC1155InterfaceIdBytes = hexlify("0xd9b67a26");
      const supportsInterface = await readContract({
        address: rewardAddress as `0x${string}`,
        abi: supportsInterfaceAbi,
        functionName: "supportsInterface",
        args: [ERC1155InterfaceIdBytes],
      });
      if (supportsInterface) return true;
    } catch (error) {
      handleVerificationErrors(error);
      return false;
    }
    return false;
  };

  const handleVerificationErrors = (error: any): void => {
    if (JSON.stringify(error).includes("ContractFunctionExecutionError")) {
      setError(
        "Contract does not support correct interface. Or the contract does not exist on the chain in which you have deployed your contract.",
      );
    } else {
      setError(
        "Something went wrong and we cannot use the entered contract as rewards contract.",
      );
    }
  };

  return {
    approveSender,
    approveRewards,
    isERC20Verified,
    isERC721Verified,
    isERC1155Verified,
    setDepositKey,
  };
}
