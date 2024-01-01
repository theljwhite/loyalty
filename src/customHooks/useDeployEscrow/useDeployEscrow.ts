import { useDeployLoyaltyStore } from "../useDeployLoyalty/store";
import { useContractFactoryParams } from "../useContractFactoryParams/useContractFactoryParams";
import { EscrowContractState, useDeployEscrowStore } from "./store";
import { useError } from "../useError";
import { useEthersSigner } from "~/helpers/ethers";
import { ContractFactory } from "ethers";
import {
  prepareWriteContract,
  writeContract,
  waitForTransaction,
} from "wagmi/actions";
import Loyalty from "~/contractsAndAbis/Loyalty/Loyalty.json";

export function useDeployEscrow() {
  const {
    escrowType,
    setError,
    setIsLoading,
    setIsSuccess,
    setDeployEscrowData,
    setIsEscrowContractSetInLoyalty,
    setContractState,
  } = useDeployEscrowStore((state) => state);

  const { rewardType, programEndsAt, deployLoyaltyData } =
    useDeployLoyaltyStore();
  const { error, handleErrorFlow } = useError();
  const signer = useEthersSigner();
  const factoryParams = useContractFactoryParams();

  const deployEscrowContract = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const escrowFactory = new ContractFactory(
        factoryParams.abi,
        factoryParams.bytecode,
        await signer,
      );
      const escrowContract = await escrowFactory.deploy(
        deployLoyaltyData.address,
        deployLoyaltyData.creator,
        Date.parse(`${programEndsAt}`) / 1000,
      );
      const transaction = escrowContract.deploymentTransaction();
      if (transaction) {
        const escrowContractAddress = await escrowContract.getAddress();
        setDeployEscrowData(transaction.hash, escrowContractAddress);

        await attachEscrowToLoyalty();

        setIsLoading(false);
        setIsSuccess(true);

        //TODO - database calls
      }
    } catch (e) {
      setError(error);
      handleErrorFlow(e, "Escrow contract could not be deployed");
      console.log("error", error);
    }
  };

  const attachEscrowToLoyalty = async (): Promise<void> => {
    const loyaltyContractConfig = {
      address: deployLoyaltyData.address as `0x${string}`,
      abi: Loyalty.abi,
    };

    const writeConfig = await prepareWriteContract({
      ...loyaltyContractConfig,
      functionName: "setEscrowContract",
      args: [deployLoyaltyData.address, rewardType],
    });

    const { hash } = await writeContract(writeConfig);
    await waitForTransaction({ hash });

    setIsEscrowContractSetInLoyalty(true);
    setContractState(EscrowContractState.AwaitingEscrowApprovals);
  };

  return { deployEscrowContract };
}
