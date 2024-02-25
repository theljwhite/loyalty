import { useEscrowAbi } from "../useContractAbi/useContractAbi";
import { useDepositRewardsStore } from "./store";
import { useAccount } from "wagmi";
import { erc721ABI as standardERC721Abi } from "wagmi";
import { waitForTransaction, writeContract, readContract } from "wagmi/actions";
import { encodeBytes32String } from "ethers";
import Moralis from "moralis";
import { type TransactionsListItem, type TransactionItemType } from "./store";
import {
  dismissToast,
  toastError,
  toastLoading,
} from "~/components/UI/Toast/Toast";
import useDepositRewards from "./useDepositRewards";

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
    setTransactionList,
    setTxListLoading,
    setTxListError,
  } = useDepositRewardsStore((state) => state);

  const { abi: erc721EscrowAbi } = useEscrowAbi("ERC721");

  const { getWalletTransactionsVerbose } = useDepositRewards(
    rewardAddress,
    escrowAddress,
    deployedChainId,
  );

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
        dismissToast();
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
      toastLoading("Deposit request sent to wallet", true);

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

  const getNftDepositTransfers = async (): Promise<
    TransactionsListItem[] | undefined
  > => {
    try {
      if (!Moralis.Core.isStarted) {
        await Moralis.start({
          apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
        });
      }
      const response = await Moralis.EvmApi.nft.getNFTContractTransfers({
        chain: deployedChainId,
        format: "decimal",
        address: rewardAddress,
      });

      if (response) {
        const results = response.toJSON();
        const transfersToEscrow = results.result.filter(
          (transfer) =>
            transfer.from_address === userConnectedAddress?.toLowerCase() &&
            transfer.to_address === escrowAddress.toLowerCase(),
        );

        const formattedTransfers: TransactionsListItem[] =
          transfersToEscrow.map((transfer) => ({
            to: transfer.to_address,
            from: transfer.from_address ?? "",
            amount: transfer.amount ?? "",
            tokenId: transfer.token_id,
            type: "DEPOSIT" as TransactionItemType,
            time: new Date(transfer.block_timestamp),
            blockHash: transfer.block_hash,
            blockNumber: transfer.block_number,
          }));

        const transfersAndTransfersGroupedByBlock: TransactionsListItem[] =
          Object.values(
            formattedTransfers.reduce(
              (prev, curr) => {
                const blockNumber =
                  curr.blockNumber as keyof TransactionsListItem;

                if (!prev[blockNumber]) prev[blockNumber] = [];

                prev[blockNumber]!.push(curr);
                return prev;
              },
              {} as Record<string, TransactionsListItem[]>,
            ),
          ).flatMap((transactions) => {
            if (transactions.length > 1) {
              const batchTransferAmount = transactions.length;

              return [
                {
                  to: transactions[0]?.to ?? "",
                  from: transactions[0]?.from ?? "",
                  amount: String(batchTransferAmount),
                  tokenId: undefined,
                  time: transactions[0]?.time ?? new Date(),
                  type: "BATCH_DEPOSIT",
                  blockHash: null,
                  blockNumber: transactions[0]?.blockNumber,
                },
              ];
            }

            return transactions;
          });

        return transfersAndTransfersGroupedByBlock;
      }
    } catch (error) {
      console.error("Error from getNftDepositTransfers", error);
      setTxListError("Error fetching NFT transfers - try again later.");
    }
  };

  const fetchAllERC721Transactions = async (): Promise<void> => {
    setTxListLoading(true);
    const walletTransactions = await getWalletTransactionsVerbose();
    const nftTransfers = await getNftDepositTransfers();

    if (walletTransactions && nftTransfers) {
      const combinedTransactions: TransactionsListItem[] = [
        ...nftTransfers,
        ...walletTransactions,
      ].sort((a, b) => b.time.getTime() - a.time.getTime());

      setTransactionList(combinedTransactions);
      setTxListLoading(false);
    }
  };

  const handleDepositErrors = (error: Error): void => {
    console.log("error from handle deposit errors -->", error);
    const errorMessage = error.message.toLowerCase();
    let toastErrorMessage: string = "";
    if (errorMessage.includes("user rejected the request")) {
      toastErrorMessage = "You rejected the wallet request";
    }
    if (errorMessage.includes("transfer from incorrect owner")) {
      toastErrorMessage =
        "You do not own a token you tried to deposit. Did you already deposit this token?";
    }
    toastError(
      toastErrorMessage ?? "Error depositing. Please try again later.",
    );
  };

  return { depositERC721, fetchAllERC721Transactions };
}
