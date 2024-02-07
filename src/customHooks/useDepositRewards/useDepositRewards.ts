import { allMoralisEvmChains } from "~/configs/moralis";
import { type EvmChain } from "moralis/common-evm-utils";
import { fetchBalance, fetchToken } from "wagmi/actions";
import { type FetchTokenResult } from "wagmi/actions";
import { useAccount, useContractWrite } from "wagmi";
import { parseUnits } from "ethers";
import { useContractFactoryParams } from "../useContractFactoryParams/useContractFactoryParams";

//TODO - error handle / loading etc state for UI (maybe just with state, no zustand store)
//TODO 2/6 - this is unfinished btw

export default function useDepositRewards(
  rewardAddress: string,
  deployedChainId: number,
) {
  const { address: userConnectedAddress } = useAccount();
  const { abi: erc20Abi } = useContractFactoryParams("ERC20");

  const {
    data: erc20Write,
    isLoading: erc20WriteLoading,
    isSuccess: erc20WriteSuccess,
    write: depositErc20Write,
  } = useContractWrite({
    address: rewardAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "depositBudget",
  });

  const depositERC20 = async (depositAmount: string): Promise<void> => {
    const balanceError = await checkUserERC20Balance(depositAmount);
    if (!balanceError) {
      //TODO - deposit balance to contract
      console.log("no err");
    }
  };

  const checkUserERC20Balance = async (
    depositAmount: string,
  ): Promise<string> => {
    try {
      const tokenInfo: FetchTokenResult = await fetchToken({
        address: rewardAddress as `0x${string}`,
        chainId: deployedChainId,
      });

      const formattedDepositAmount: bigint = parseUnits(
        depositAmount,
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
      else return "Insufficient balance";
    } catch (error) {
      return "Error fetching token balances. Try later.";
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
