import { useEscrowAbi } from "../useContractAbi/useContractAbi";
import { useDepositRewardsStore } from "./store";
import { useAccount } from "wagmi";
import { erc721ABI as standardERC721Abi } from "wagmi";
import { waitForTransaction, writeContract, readContract } from "wagmi/actions";
import { encodeBytes32String } from "ethers";

export default function useDepositNFTRewards(
  rewardAddress: string,
  escrowAddress: string,
  deployedChainId: number,
) {
  const { address: userConnectedAddress } = useAccount();

  const {
    setIsLoading,
    setIsSuccess,
    setError,
    setDepositReceipt,
    setIsDepositReceiptOpen,
  } = useDepositRewardsStore((state) => state);

  const { abi: erc721EscrowAbi } = useEscrowAbi("ERC721");

  const handleDepositContractWrite = async (
    tokenIds: string[],
    depositKeyBytes: string,
  ): Promise<void> => {
    try {
      const depositTx = await writeContract({
        address: escrowAddress as `0x${string}`,
        abi: erc721EscrowAbi,
        functionName: "safeBatchTransfer",
        args: [rewardAddress, tokenIds, depositKeyBytes],
      });

      const depositReceipt = await waitForTransaction({ hash: depositTx.hash });

      if (depositReceipt.status === "success") {
        setIsLoading(false);
        setIsSuccess(true);
        setDepositReceipt({
          hash: depositReceipt.blockHash,
          gasUsed: depositReceipt.gasUsed,
          gasPrice: depositReceipt.effectiveGasPrice,
        });
        setIsDepositReceiptOpen(true);
      }

      if (depositReceipt.status === "reverted") {
        setIsLoading(false);
        setError("Transaction reverted. Try again later.");
      }
    } catch (error) {
      handleDepositErrors(error as Error);
    }
  };

  const depositERC721 = async (
    tokenIds: string[],
    depositKey: string,
  ): Promise<void> => {
    try {
      setIsLoading(true);

      const depositKeyBytes32 = encodeBytes32String(depositKey);

      const isApprovedForAll = await readContract({
        address: rewardAddress as `0x${string}`,
        abi: standardERC721Abi,
        functionName: "isApprovedForAll",
        args: [
          userConnectedAddress as `0x${string}`,
          escrowAddress as `0x${string}`,
        ],
      });

      if (isApprovedForAll) {
        await handleDepositContractWrite(tokenIds, depositKeyBytes32);
      } else {
        const setApprovalForAll = await writeContract({
          address: rewardAddress as `0x${string}`,
          abi: standardERC721Abi,
          functionName: "setApprovalForAll",
          args: [escrowAddress as `0x${string}`, true],
        });

        const setApprovalForAllReceipt = await waitForTransaction({
          hash: setApprovalForAll.hash,
        });

        if (setApprovalForAllReceipt.status === "success") {
          await handleDepositContractWrite(tokenIds, depositKeyBytes32);
        }
      }
    } catch (error) {
      handleDepositErrors(error as Error);
    }
  };

  const handleDepositErrors = (error: Error): void => {
    //TODO
    console.log("error from handle deposit errors -->", error);
  };

  return { depositERC721 };
}
