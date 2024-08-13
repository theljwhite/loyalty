import { type EscrowType } from "@prisma/client";
import { type TransactionReceipt } from "viem";
import { useEscrowAbi } from "../useContractAbi/useContractAbi";
import { formatUnits } from "ethers";
import { writeContract, waitForTransaction, signMessage } from "wagmi/actions";

export default function useContractAccount(
  escrowAddress: string,
  escrowType: EscrowType,
  chainId: number,
) {
  const { abi } = useEscrowAbi(escrowType);

  const escrowConfig = {
    address: escrowAddress as `0x${string}`,
    abi,
    chainId,
  };

  const doSignMessage = async (): Promise<void> => {
    await signMessage({
      message: `${process.env.NEXT_PUBLIC_PROJECT_NAME} needs you to sign this message to verify the authenticity of your request.`,
    });
  };

  const userWithdrawERC20 = async (
    amount: number,
  ): Promise<TransactionReceipt> => {
    const amountInWei = formatUnits(amount, "wei");

    await doSignMessage();

    const userWithdraw = await writeContract({
      ...escrowConfig,
      functionName: "userWithdraw",
      args: [amountInWei],
    });

    const txReceipt = await waitForTransaction({
      hash: userWithdraw.hash,
      chainId,
    });

    return txReceipt;
  };

  //this same call will work for ERC20, ERC721, ERC1155 escrow
  const userWithdrawAll = async (): Promise<TransactionReceipt> => {
    await doSignMessage();

    const userWithdraw = await writeContract({
      ...escrowConfig,
      functionName: "userWithdrawAll",
      args: [],
    });

    const txReceipt = await waitForTransaction({
      hash: userWithdraw.hash,
      chainId,
    });

    return txReceipt;
  };

  const creatorWithdrawERC20 = async (
    amount: number,
  ): Promise<TransactionReceipt> => {
    const amountInWei = formatUnits(amount, "wei");

    await doSignMessage();

    const creatorWithdraw = await writeContract({
      ...escrowConfig,
      functionName: "creatorWithdraw",
      args: [amountInWei],
    });

    const txReceipt = await waitForTransaction({
      hash: creatorWithdraw.hash,
      chainId,
    });
    return txReceipt;
  };

  //this same call will work for ERC20, ERC721 escrow, and also ERC1155 once abi is changed
  const creatorWithdrawAll = async (): Promise<TransactionReceipt> => {
    await doSignMessage();

    const creatorWithdraw = await writeContract({
      ...escrowConfig,
      functionName: "creatorWithdrawAll",
      args: [],
    });

    const txReceipt = await waitForTransaction({
      hash: creatorWithdraw.hash,
      chainId,
    });
    return txReceipt;
  };

  return {
    userWithdrawERC20,
    userWithdrawAll,
    creatorWithdrawERC20,
    creatorWithdrawAll,
  };
}
