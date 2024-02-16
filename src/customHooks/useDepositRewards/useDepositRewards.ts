import { allMoralisEvmChains } from "~/configs/moralis";
import {
  type GetWalletTokenTransfersJSONResponse,
  type EvmChain,
  type GetWalletTransactionsVerboseJSONResponse,
} from "moralis/common-evm-utils";
import { type TransactionItemType } from "./store";
import { fetchBalance, fetchToken } from "wagmi/actions";
import Moralis from "moralis";
import { type FetchTokenResult } from "wagmi/actions";
import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi";
import { decodeBytes32String, parseUnits } from "ethers";
import { useEscrowAbi } from "../useContractAbi/useContractAbi";
import { useDepositRewardsStore } from "./store";
import { toastLoading } from "~/components/UI/Toast/Toast";

//TODO - this is unfinished and may need some reformatting to clean up a bit.
//but for the first pass, it should work for now.
//can get rid of the arguments in the hook with additional DB fetches
//from this hook instead of passing the values in elsewhere.
//(probably wont even require an extra call due to query caching)

//2-7 working on this and the entire Escrow > Wallet > Deposit flow

export default function useDepositRewards(
  rewardAddress: string,
  escrowAddress: string,
  deployedChainId: number,
) {
  const { address: userConnectedAddress } = useAccount();
  const { abi: erc20Abi } = useEscrowAbi("ERC20");

  const {
    erc20DepositAmount,
    transactionList,
    setIsLoading,
    setIsSuccess,
    setError,
    setDepositReceipt,
    setTransactionList,
    setTxListError,
    setTxListLoading,
  } = useDepositRewardsStore((state) => state);

  const { data: erc20DepositData, write: depositERC20ToContract } =
    useContractWrite({
      address: escrowAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "depositBudget",
      args: [],
    });

  const depositERC20 = async (): Promise<void> => {
    setIsLoading(true);
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
        const depositTransaction = useWaitForTransaction({
          hash: erc20DepositData?.hash,
        });

        if (depositTransaction.isSuccess) {
          setDepositReceipt({
            hash: depositTransaction.data?.transactionHash as string,
            gasUsed: depositTransaction.data?.gasUsed ?? BigInt(0),
            gasPrice: depositTransaction.data?.effectiveGasPrice ?? BigInt(0),
          });
          setIsLoading(false);
          setIsSuccess(true);
        }
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
        return errorMessage;
      }
    } catch (error) {
      errorMessage = "Error fetching token balances. Try later.";
      setError(errorMessage);
      return errorMessage;
    }
  };

  const getWalletTransactionsVerbose = async (): Promise<
    GetWalletTransactionsVerboseJSONResponse["result"] | undefined
  > => {
    setTxListLoading(true);

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
          };

          return transaction;
        });

        setTransactionList(formattedTransactions);
        return relevantTransactions;
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
    GetWalletTokenTransfersJSONResponse["result"] | undefined
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
        return transfers;
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

  const findIfMoralisEvmChain = (): EvmChain | undefined => {
    const deployedEvmChain = allMoralisEvmChains.find(
      (chain) => Number(chain.hex) === deployedChainId,
    );

    if (deployedEvmChain) return deployedEvmChain;
    else return undefined;
  };

  return {
    depositERC20,

    getWalletERC20Transfers,
    getWalletTransactionsVerbose,
  };
}
