import { useSession } from "next-auth/react";
import { useDeployLoyaltyStore } from "../useDeployLoyalty/store";
import { useEscrowApprovalsStore } from "../useEscrowApprovals/store";
import { useEscrowAbi, useLoyaltyAbi } from "../useContractAbi/useContractAbi";
import { EscrowContractState, useDeployEscrowStore } from "./store";
import { useError } from "../useError";
import { useEthersSigner } from "~/helpers/ethers";
import { ContractFactory } from "ethers";
import {
  prepareWriteContract,
  writeContract,
  waitForTransaction,
} from "wagmi/actions";
import { api } from "~/utils/api";
import {
  dismissToast,
  toastLoading,
  toastSuccess,
} from "~/components/UI/Toast/Toast";

export function useDeployEscrow() {
  const {
    setError,
    setIsLoading,
    setIsSuccess,
    setDeployEscrowData,
    setIsEscrowContractSetInLoyalty,
    setContractState,
  } = useDeployEscrowStore((state) => state);
  const { escrowType } = useEscrowApprovalsStore((state) => state);

  const { rewardType, programEndsAt, deployLoyaltyData } =
    useDeployLoyaltyStore((state) => state);

  const { rewardAddress, senderAddress } = useEscrowApprovalsStore(
    (state) => state,
  );

  const { error, handleErrorFlow } = useError();
  const signer = useEthersSigner();
  const factoryParams = useEscrowAbi(escrowType);
  const { abi: loyaltyAbi } = useLoyaltyAbi();
  const { data: session } = useSession();
  const { mutate: createEscrowDbRecord } =
    api.escrow.createEscrow.useMutation();

  const deployEscrowContract = async (): Promise<void> => {
    setIsLoading(true);
    toastLoading("Escrow deploy request sent.", true);
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
        rewardAddress,
        senderAddress ? [senderAddress] : [],
      );
      const transaction = escrowContract.deploymentTransaction();
      if (transaction) {
        dismissToast();

        const escrowContractAddress = await escrowContract.getAddress();
        setDeployEscrowData(transaction.hash, escrowContractAddress);

        await attachEscrowToLoyalty(escrowContractAddress);

        setIsLoading(false);
        setIsSuccess(true);
        toastSuccess("Escrow contract successfully deployed");

        createEscrowDbRecord({
          address: escrowContractAddress,
          creatorId: session?.user.id ?? "",
          escrowType,
          state: "AwaitingEscrowApprovals",
          loyaltyAddress: deployLoyaltyData.address,
          rewardAddress,
          senderAddress,
        });
      }
    } catch (e) {
      console.error("ERROR FROM ESCROW DEPLOY", error);
      setError("Escrow contract could not be deployed");
      handleErrorFlow(e, "Escrow contract could not be deployed");
    }
  };

  const attachEscrowToLoyalty = async (
    escrowAddress: string,
  ): Promise<void> => {
    const loyaltyContractConfig = {
      address: deployLoyaltyData.address as `0x${string}`,
      abi: loyaltyAbi,
    };

    const writeConfig = await prepareWriteContract({
      ...loyaltyContractConfig,
      functionName: "setEscrowContract",
      args: [escrowAddress, rewardType],
    });

    const { hash } = await writeContract(writeConfig);
    await waitForTransaction({ hash });

    setIsEscrowContractSetInLoyalty(true);
    setContractState(EscrowContractState.AwaitingEscrowApprovals);
  };

  return { deployEscrowContract };
}
