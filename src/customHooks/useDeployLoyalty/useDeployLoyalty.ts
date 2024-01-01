import Loyalty from "~/contractsAndAbis/Loyalty/Loyalty.json";
import { useAccount, useNetwork } from "wagmi";
import { ContractFactory, encodeBytes32String } from "ethers";
import { waitForTransaction } from "wagmi/actions";
import { useDeployLoyaltyStore } from "./store";
import { useContractFactoryStore } from "../useContractFactory";
import { useEthersSigner } from "~/helpers/ethers";
import { useError } from "../useError";

export function useDeployLoyalty() {
  const loyaltyDeployState = useContractFactoryStore((state) => state);
  const {
    name,
    objectives,
    authorities,
    tiers,
    rewardType,
    programEndsAt,
    contractRequirements,
    setDeployLoyaltyData,
    setIsLoading,
  } = useDeployLoyaltyStore((state) => state);

  const { chain } = useNetwork();
  const { address } = useAccount();
  const signer = useEthersSigner();
  const { error, handleErrorFlow } = useError();

  const deployLoyaltyProgram = async (): Promise<void> => {
    try {
      const loyaltyFactory = new ContractFactory(
        Loyalty.abi,
        Loyalty.bytecode,
        await signer,
      );
      const targetObjectivesBytes32 = objectives.map((obj) =>
        encodeBytes32String(obj.title),
      );
      const authoritiesBytes32 = authorities.map((a) => encodeBytes32String(a));
      const objectivesRewards: number[] = objectives.map((obj) => obj.reward);
      const tierSortingEnabled = tiers && tiers.length > 0;
      const loyaltyContract = await loyaltyFactory.deploy(
        name,
        targetObjectivesBytes32,
        authoritiesBytes32,
        objectivesRewards,
        rewardType,
        Date.parse(`${programEndsAt}`) / 1000,
        tierSortingEnabled,
      );
      const loyaltyContractAddress = await loyaltyContract.getAddress();
      const transaction = loyaltyContract.deploymentTransaction();

      console.log("loyalty contract address -->", loyaltyContractAddress);
      console.log("tx -->", transaction);

      if (transaction) {
        const deployReceipt = await waitForTransaction({
          chainId: chain?.id,
          hash: transaction.hash as `0x${string}`,
        });

        setDeployLoyaltyData(
          chain?.name ?? "",
          chain?.id ?? 0,
          deployReceipt.transactionHash,
          loyaltyContractAddress,
          address as string,
        );

        //TODO - database stuff
        console.log("receipt", deployReceipt);
      }
    } catch (error) {
      console.log("error", error);
      handleErrorFlow(error, "Loyalty program could not be deployed");
      loyaltyDeployState.setStatus("ERROR");
      loyaltyDeployState.setError(error as any);
    }
  };

  return { deployLoyaltyProgram };
}
