import { useEscrowAbi } from "../useContractAbi/useContractAbi";
import { useEscrowSettingsStore } from "./store";
import { writeContract } from "wagmi/actions";

export default function useEscrowSettings(escrowAddress: string) {
  const {
    rewardGoal,
    erc721RewardOrder,
    erc721RewardCondition,
    setIsLoading,
    setIsSuccess,
    setError,
  } = useEscrowSettingsStore((state) => state);

  const { abi: erc20EscrowAbi } = useEscrowAbi("ERC20");
  const { abi: erc721EscrowAbi } = useEscrowAbi("ERC721");
  const { abi: erc1155EscrowAbi } = useEscrowAbi("ERC1155");

  const setERC721EscrowSettings = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const setERC721Settings = await writeContract({
        abi: erc721EscrowAbi,
        address: escrowAddress as `0x${string}`,
        functionName: "setEscrowSettings",
        args: [erc721RewardOrder, erc721RewardCondition, rewardGoal],
      });

      if (setERC721Settings.hash) {
        setIsSuccess(true);
        setIsLoading(false);
      }
    } catch (error) {
      handleSettingsErrors(error as Error);
    }
  };

  const handleSettingsErrors = (error: Error): void => {
    setError(JSON.stringify(error).slice(0, 50));
  };

  return { setERC721EscrowSettings };
}
