import Loyalty from "~/contractsAndAbis/Loyalty/Loyalty.json";
import { useAccount, useNetwork } from "wagmi";
import { ContractFactory, encodeBytes32String } from "ethers";
import { waitForTransaction } from "wagmi/actions";
import { useDeployLoyaltyStore } from "./store";
import { useContractFactoryStore } from "../useContractFactory";
import { useEthersSigner } from "~/helpers/ethers";
import { useError } from "../useError";
import { api } from "~/utils/api";
import { Authority, RewardType } from "./types";

export function useDeployLoyalty() {
  const loyaltyDeployState = useContractFactoryStore((state) => state);
  const {
    name,
    objectives,
    authorities,
    tiers,
    rewardType,
    programStart,
    programEndsAt,
    contractRequirements,
    setDeployLoyaltyData,
  } = useDeployLoyaltyStore((state) => state);

  const { chain } = useNetwork();
  const { address } = useAccount();
  const signer = useEthersSigner();
  const { error, handleErrorFlow } = useError();
  const { mutate: createDbLoyaltyProgramRecord } =
    api.loyaltyPrograms.createLoyaltyProgramWithObjectives.useMutation();

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

        const objectivesDbRecord = objectives.map((obj, index) => ({
          title: obj.title,
          reward: obj.reward,
          authority: authorities[index] as Authority,
          indexInContract: index,
        }));

        createDbLoyaltyProgramRecord({
          name,
          state: "Idle",
          address: loyaltyContractAddress,
          creatorId: "userIdHere",
          objectives: objectivesDbRecord,
          chainId: chain?.id ?? 0,
          chain: chain?.name ?? "",
          programStart,
          programEnd: programEndsAt,
          rewardType,
        });

        console.log("loyalty contract address -->", loyaltyContractAddress);
        console.log("tx -->", transaction);
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
