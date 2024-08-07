import { type TransactionsListItem, type TransactionItemType } from "./store";
import { fetchBalance, fetchToken } from "wagmi/actions";
import Moralis from "moralis";
import { type FetchTokenResult } from "wagmi/actions";
import { erc20ABI as standardERC20Abi } from "wagmi";
import { useAccount } from "wagmi";
import { waitForTransaction, writeContract, readContract } from "wagmi/actions";
import { encodeBytes32String, parseUnits } from "ethers";
import { findIfMoralisEvmChain } from "~/configs/moralis";
import { useEscrowAbi } from "../useContractAbi/useContractAbi";
import { useError } from "../useError";
import { useDepositRewardsStore } from "./store";
import {
  toastLoading,
  toastError,
  dismissToast,
} from "~/components/UI/Toast/Toast";

//TODO - this needs cleaned up
//TODO 7/10 - can change where deposit key comes from if decide to make user enter it

export default function useDepositRewards(
  rewardAddress: string,
  escrowAddress: string,
  deployedChainId: number,
) {
  const { address: userConnectedAddress } = useAccount();
  const { abi: erc20Abi } = useEscrowAbi("ERC20");
  const { handleERC20EscrowError } = useError();

  const {
    erc20DepositAmount,
    setIsLoading,
    setIsSuccess,
    setError,
    setDepositReceipt,
    setIsDepositReceiptOpen,
    setTransactionList,
    setTxListError,
    setTxListLoading,
  } = useDepositRewardsStore((state) => state);

  const handleApproveAndDeposit = async (depositKey: string): Promise<void> => {
    setIsLoading(true);
    try {
      const allowance = await readContract({
        address: rewardAddress as `0x${string}`,
        abi: standardERC20Abi,
        functionName: "allowance",
        args: [
          userConnectedAddress as `0x${string}`,
          escrowAddress as `0x${string}`,
        ],
      });
      const tokenInfo: FetchTokenResult = await fetchToken({
        address: rewardAddress as `0x${string}`,
        chainId: deployedChainId,
      });
      const formattedDepositAmount: bigint = parseUnits(
        erc20DepositAmount,
        tokenInfo.decimals,
      );
      if (allowance && allowance >= formattedDepositAmount) {
        await depositERC20(depositKey);
      } else {
        toastLoading("Approve escrow to manage your reward tokens.", true);
        const approveTx = await writeContract({
          address: rewardAddress as `0x${string}`,
          abi: standardERC20Abi,
          functionName: "approve",
          args: [escrowAddress as `0x${string}`, formattedDepositAmount],
        });

        const approveReceipt = await waitForTransaction({
          hash: approveTx.hash,
        });

        if (approveReceipt.status === "success") {
          dismissToast();
          await depositERC20(depositKey);
        }
      }
    } catch (error) {
      handleDepositErrors(error as Error);
    }
  };

  const depositERC20 = async (depositKey: string): Promise<void> => {
    toastLoading("Deposit request sent to wallet", true);
    const balanceError = await checkUserERC20Balance();

    if (!balanceError) {
      try {
        const tokenInfo: FetchTokenResult = await fetchToken({
          address: rewardAddress as `0x${string}`,
          chainId: deployedChainId,
        });
        const formattedDepositAmount: bigint = parseUnits(
          erc20DepositAmount,
          tokenInfo.decimals,
        );

        const depositKeyBytes32 = encodeBytes32String(depositKey);

        const depositTx = await writeContract({
          address: escrowAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "depositBudget",
          args: [formattedDepositAmount, depositKeyBytes32],
        });

        const depositReceipt = await waitForTransaction({
          hash: depositTx.hash,
        });

        if (depositReceipt.status === "success") {
          setDepositReceipt({
            hash: depositReceipt.blockHash,
            gasUsed: depositReceipt.gasUsed,
            gasPrice: depositReceipt.effectiveGasPrice,
          });
          setIsLoading(false);
          setIsSuccess(true);
          setIsDepositReceiptOpen(true);
          dismissToast();
        }
      } catch (error) {
        handleDepositErrors(error as Error);
      }
    }
  };

  const checkUserERC20Balance = async (): Promise<string> => {
    let errorMessage: string = "";
    try {
      const tokenInfo: FetchTokenResult = await fetchToken({
        address: rewardAddress as `0x${string}`,
        chainId: deployedChainId,
      });

      const formattedDepositAmount: bigint = parseUnits(
        erc20DepositAmount,
        tokenInfo.decimals,
      );
      const balance = await fetchBalance({
        address: userConnectedAddress as `0x${string}`,
        token: rewardAddress as `0x${string}`,
        chainId: deployedChainId,
      });
      const formattedBalance =
        typeof balance.value === "bigint"
          ? balance.value
          : BigInt(balance.value);

      if (formattedBalance >= formattedDepositAmount) return "";
      else {
        errorMessage = "Insufficient balance";
        setError(errorMessage);
        toastError("Your token balance is insufficient for specified amount.");
        return errorMessage;
      }
    } catch (error) {
      errorMessage = "Error fetching token balances. Try later.";
      setError(errorMessage);
      return errorMessage;
    }
  };

  const getWalletTransactionsVerbose = async (): Promise<
    TransactionsListItem[] | undefined
  > => {
    try {
      const evmChain = findIfMoralisEvmChain(deployedChainId);
      if (!evmChain) {
        setTxListError(
          "Couldnt fetch transactions for deployed chain at this time",
        );
        return;
      }
      if (!Moralis.Core.isStarted) {
        await Moralis.start({
          apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
        });
      }
      const response =
        await Moralis.EvmApi.transaction.getWalletTransactionsVerbose({
          address: userConnectedAddress ?? "",
          chain: evmChain,
          limit: 10,
        });

      if (response) {
        const results = response.toJSON();
        const relevantTransactions = results.result.filter(
          (tx) =>
            tx.to_address === escrowAddress.toLowerCase() ||
            tx.receipt_contract_address === escrowAddress.toLowerCase(),
        );

        const formattedTransactions = relevantTransactions.map((tx) => {
          let transactionType: TransactionItemType = "UNKNOWN";
          if (
            tx.to_address == escrowAddress.toLowerCase() &&
            tx.value === "0"
          ) {
            transactionType = "CONTRACT_CALL";
          }
          if (
            !tx.to_address &&
            tx.receipt_contract_address === escrowAddress.toLowerCase()
          ) {
            transactionType = "CONTRACT_CREATION";
          }
          const transaction = {
            to: tx.to_address,
            from: tx.from_address,
            amount: tx.value,
            type: transactionType,
            time: new Date(tx.block_timestamp),
            blockHash: tx.block_hash,
          };
          return transaction;
        });

        return formattedTransactions;
      }
    } catch (error) {
      setTxListError(
        `Error fetching transactions. Details: ${JSON.stringify(error).slice(
          0,
          50,
        )}`,
      );
    }
  };

  const getWalletERC20Transfers = async (): Promise<
    TransactionsListItem[] | undefined
  > => {
    try {
      const evmChain = findIfMoralisEvmChain(deployedChainId);
      if (!evmChain) {
        setTxListError(
          "Couldnt fetch transactions for deployed chain at this time",
        );
        return;
      }
      if (!Moralis.Core.isStarted) {
        await Moralis.start({
          apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
        });
      }

      const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
        chain: evmChain,
        address: userConnectedAddress ?? "",
      });
      if (response) {
        const results = response.toJSON();
        const transfers = results.result.filter(
          (transfer) =>
            transfer.from_address === userConnectedAddress?.toLowerCase() &&
            transfer.to_address === escrowAddress.toLowerCase(),
        );

        const formattedTransfers = transfers.map((tx) => ({
          to: tx.to_address,
          from: tx.from_address,
          amount: tx.value_decimal as string,
          type: "DEPOSIT" as TransactionItemType,
          time: new Date(tx.block_timestamp),
          blockHash: tx.block_hash,
        }));

        return formattedTransfers;
      }
    } catch (error) {
      setTxListError(
        `Error fetching transactions. Details: ${JSON.stringify(error).slice(
          0,
          50,
        )}`,
      );
    }
  };

  const fetchAllERC20Transactions = async (): Promise<void> => {
    setTxListLoading(true);
    const walletTransactions = await getWalletTransactionsVerbose();
    const walletERC20Transfers = await getWalletERC20Transfers();

    if (walletTransactions && walletERC20Transfers) {
      const filteredMatchingTransactions = walletTransactions.filter(
        (walletTx) =>
          !walletERC20Transfers.some(
            (walletTransfer) => walletTx.blockHash === walletTransfer.blockHash,
          ),
      );
      const combinedTransactions: TransactionsListItem[] = [
        ...walletERC20Transfers,
        ...filteredMatchingTransactions,
      ];
      setTxListLoading(false);
      setTransactionList(combinedTransactions);
    }
  };

  const handleDepositErrors = (error: Error): void => {
    dismissToast();
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes("insufficient allowance")) {
      toastError("Insufficient allowance for reward token");
      return;
    }
    handleERC20EscrowError(error, "Failed to deposit ERC20");
  };

  return {
    depositERC20,
    handleApproveAndDeposit,
    fetchAllERC20Transactions,
    getWalletTransactionsVerbose,
  };
}
