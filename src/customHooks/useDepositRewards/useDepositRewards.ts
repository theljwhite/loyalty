import { allMoralisEvmChains } from "~/configs/moralis";
import { type EvmChain } from "moralis/common-evm-utils";
import { fetchBalance, fetchToken } from "wagmi/actions";
import { type FetchTokenResult } from "wagmi/actions";
import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi";
import { parseUnits } from "ethers";
import { useContractFactoryParams } from "../useContractFactoryParams/useContractFactoryParams";
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
  const { abi: erc20Abi } = useContractFactoryParams("ERC20");

  const {
    erc20DepositAmount,
    setIsLoading,
    setIsSuccess,
    setError,
    setDepositReceipt,
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
        console.log("deposit tx -->", depositTransaction.data);
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
        console.log("error from deposit-->", error);
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

  const findIfMoralisEvmChain = (): EvmChain | undefined => {
    //TODO - this will be used later for ERC721 and ERC1155 balances
    const deployedEvmChain = allMoralisEvmChains.find(
      (chain) => Number(chain.hex) === deployedChainId,
    );
    console.log("dep", deployedChainId);
    if (deployedEvmChain) return deployedEvmChain;
    else return undefined;
  };

  return { depositERC20 };
}
