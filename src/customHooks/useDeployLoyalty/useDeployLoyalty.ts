import Loyalty from "~/contractsAndAbis/Loyalty/Loyalty.json";
import { useSession } from "next-auth/react";
import { useAccount, useNetwork } from "wagmi";
import { ContractFactory, encodeBytes32String } from "ethers";
import { waitForTransaction } from "wagmi/actions";
import { useDeployLoyaltyStore } from "./store";
import { useContractFactoryStore } from "../useContractFactory";
import { useEthersSigner } from "~/helpers/ethers";
import { useError } from "../useError";
import { api } from "~/utils/api";
import { RewardType } from "./types";
import { toastSuccess, toastLoading } from "~/components/UI/Toast/Toast";

export function useDeployLoyalty() {
  const { data: session } = useSession();
  const loyaltyDeployState = useContractFactoryStore((state) => state);
  const {
    name,
    description,
    objectives,
    tiers,
    rewardType,
    programStart,
    programEndsAt,
    setDeployLoyaltyData,
    setIsLoading,
    setIsSuccess,
  } = useDeployLoyaltyStore((state) => state);

  const { chain } = useNetwork();
  const { address } = useAccount();
  const signer = useEthersSigner();

  const { handleErrorFlow } = useError();
  const { mutate: createDbLoyaltyProgramRecord } =
    api.loyaltyPrograms.createLoyaltyProgramWithObjectives.useMutation();
  const { mutate: giveCreatorRole } = api.users.giveCreatorRole.useMutation();

  const deployLoyaltyProgram = async (): Promise<void> => {
    loyaltyDeployState.setStatus("LOADING");
    setIsLoading(true);
    toastLoading("Deploy request sent.", true);
    try {
      const loyaltyFactory = new ContractFactory(
        Loyalty.abi,
        Loyalty.bytecode,
        await signer,
      );
      const targetObjectivesBytes32 = objectives.map((obj) =>
        encodeBytes32String(obj.title.trim().slice(0, 30)),
      );
      const authoritiesBytes32 = objectives.map((obj) =>
        encodeBytes32String(obj.authority),
      );
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

        createDbLoyaltyProgramRecord({
          name,
          description,
          state:
            rewardType === RewardType.Points ? "Idle" : "AwaitingEscrowSetup",
          address: loyaltyContractAddress,
          creatorId: session?.user.id ?? "",
          objectives: objectives,
          tiers: tierSortingEnabled ? tiers : undefined,
          chainId: chain?.id ?? 0,
          chain: chain?.name ?? "",
          programStart,
          programEnd: programEndsAt,
          rewardType,
        });

        giveCreatorRole({ userId: session?.user.id ?? "" });

        loyaltyDeployState.setStatus("SUCCESS");
        setIsSuccess(true);
        toastSuccess("Loyalty program has successfully been deployed");
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
