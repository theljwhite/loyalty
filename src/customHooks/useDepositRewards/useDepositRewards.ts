import { useEffect } from "react";
import { allMoralisEvmChains } from "~/configs/moralis";
import { type EvmChain } from "moralis/common-evm-utils";
import { type TransactionsListItem, type TransactionItemType } from "./store";
import { fetchBalance, fetchToken } from "wagmi/actions";
import Moralis from "moralis";
import { type FetchTokenResult } from "wagmi/actions";
import { erc20ABI as standardERC20Abi } from "wagmi";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { parseUnits } from "ethers";
import { useEscrowAbi } from "../useContractAbi/useContractAbi";
import { useDepositRewardsStore } from "./store";
import {
  toastSuccess,
  toastLoading,
  toastError,
  dismissToast,
} from "~/components/UI/Toast/Toast";

//TODO - this is unfinished and may need some reformatting to clean up a bit.
//but for the first pass, it should work for now.

export default function useDepositRewards(
  rewardAddress: string,
  escrowAddress: string,
  deployedChainId: number,
) {
  const { address: userConnectedAddress } = useAccount();
  const { abi: erc20Abi } = useEscrowAbi("ERC20");

  const {
    erc20DepositAmount,
    setIsSuccess,
    setError,
    setDepositReceipt,
    setIsDepositReceiptOpen,
    setTransactionList,
    setTxListError,
    setTxListLoading,
  } = useDepositRewardsStore((state) => state);

  const { data: allowance } = useContractRead({
    address: rewardAddress as `0x${string}`,
    abi: standardERC20Abi,
    functionName: "allowance",
    args: [
      userConnectedAddress as `0x${string}`,
      escrowAddress as `0x${string}`,
    ],
  });

  const {
    data: approveData,
    write: approve,
    error: approveError,
  } = useContractWrite({
    address: rewardAddress as `0x${string}`,
    abi: standardERC20Abi,
    functionName: "approve",
  });

  const { data: approveReceipt } = useWaitForTransaction({
    hash: approveData ? approveData.hash : undefined,
    enabled: Boolean(approveData),
  });

  const {
    data: erc20DepositData,
    write: depositERC20ToContract,
    isSuccess: erc20DepositSuccess,
    isLoading: erc20DepositLoading,
    error: erc20DepositWriteErrror,
  } = useContractWrite({
    address: escrowAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "depositBudget",
    args: [],
  });

  const { data: depositERC20Receipt } = useWaitForTransaction({
    hash: erc20DepositData ? erc20DepositData.hash : undefined,
    enabled: Boolean(erc20DepositData),
  });

  useEffect(() => {
    if (erc20DepositLoading) {
      dismissToast();
    }
    if (erc20DepositWriteErrror) {
      handleDepositErrors(erc20DepositWriteErrror);
    }
    if (erc20DepositData && erc20DepositSuccess) {
      toastSuccess("Your deposit was successful.");
      setIsSuccess(true);
    }
    if (depositERC20Receipt) {
      setDepositReceipt({
        hash: depositERC20Receipt.transactionHash,
        gasUsed: depositERC20Receipt.gasUsed,
        gasPrice: depositERC20Receipt.effectiveGasPrice,
      });
      setIsDepositReceiptOpen(true);
    }
  }, [
    erc20DepositWriteErrror,
    erc20DepositData,
    erc20DepositSuccess,
    erc20DepositLoading,
    depositERC20Receipt,
  ]);

  useEffect(() => {
    if (approveReceipt) {
      dismissToast();
      depositERC20();
    }
    if (approveError) {
      handleDepositErrors(approveError);
    }
  }, [approveReceipt, approveError]);

  const handleApproveAndDeposit = async (): Promise<void> => {
    try {
      const tokenInfo: FetchTokenResult = await fetchToken({
        address: rewardAddress as `0x${string}`,
        chainId: deployedChainId,
      });
      const formattedDepositAmount: bigint = parseUnits(
        erc20DepositAmount,
        tokenInfo.decimals,
      );
      if (allowance && allowance >= formattedDepositAmount) {
        await depositERC20();
      } else {
        toastLoading("Approve escrow to manage your reward tokens.", true);
        approve({
          args: [escrowAddress as `0x${string}`, formattedDepositAmount],
        });
      }
    } catch (error) {
      handleDepositErrors(error as Error);
    }
  };

  const depositERC20 = async (): Promise<void> => {
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

        depositERC20ToContract({
          args: [formattedDepositAmount, rewardAddress],
        });
      } catch (error) {
        setError(JSON.stringify(error).slice(0, 50));
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
      const evmChain = findIfMoralisEvmChain();
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
      const evmChain = findIfMoralisEvmChain();
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

  const findIfMoralisEvmChain = (): EvmChain | undefined => {
    const deployedEvmChain = allMoralisEvmChains.find(
      (chain) => Number(chain.hex) === deployedChainId,
    );

    if (deployedEvmChain) return deployedEvmChain;
    else return undefined;  
  };

  const handleDepositErrors = (error: Error): void => {
    const errorMessage = error.message.toLowerCase();
    let toastErrorMessage: string = "";
    if (errorMessage.includes("insufficient allowance")) {
      toastErrorMessage = "Insufficient allowance for reward token";
    }
    if (errorMessage.includes("user rejected the request")) {
      toastErrorMessage = "You rejected the wallet request";
    }

    toastError(
      toastErrorMessage ?? "Error depositing. Please try again later.",
    );
  };

  return {
    depositERC20,
    handleApproveAndDeposit,
    fetchAllERC20Transactions,
  };
}
