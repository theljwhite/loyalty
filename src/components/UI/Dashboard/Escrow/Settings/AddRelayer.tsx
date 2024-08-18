import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { writeContract, waitForTransaction } from "wagmi/actions";
import { ETHEREUM_ADDRESS_REGEX } from "~/constants/regularExpressions";
import shortenEthereumAddress from "~/helpers/shortenEthAddress";
import { useLoyaltyAbi } from "~/customHooks/useContractAbi/useContractAbi";
import DashboardSingleInputBox from "../../DashboardSingleInputBox";
import {
  toastError,
  toastSuccess,
  toastLoading,
} from "~/components/UI/Toast/Toast";

export default function AddRelayer() {
  const [newRelayAddress, setNewRelayAddress] = useState<string>("");
  const [newRelayValid, setNewRelayValid] = useState<boolean>(true);

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { data } = api.escrow.getDepositRelatedData.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress) ?? "",
    },
    { refetchOnWindowFocus: false },
  );
  const { abi } = useLoyaltyAbi();

  const loyaltyConfig = {
    address: loyaltyAddress as `0x${string}`,
    abi,
  };

  const addRelayer = async (): Promise<void> => {
    toastLoading("Request sent to wallet.", true);
    try {
      const addRelayerTx = await writeContract({
        ...loyaltyConfig,
        functionName: "setRelayer",
        args: [newRelayAddress],
      });

      const receipt = await waitForTransaction({
        chainId: data?.loyaltyProgram?.chainId ?? 0,
        hash: addRelayerTx.hash,
      });

      if (receipt.status === "reverted") throw new Error();

      toastSuccess(
        `Successfully added new relayer: ${shortenEthereumAddress(
          newRelayAddress,
          8,
          8,
        )} `,
      );
    } catch (error) {
      toastError("Failed to add new relayer. Try again later.");
    }
  };

  const onRelayAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const { value } = e.target;
    setNewRelayAddress(value);

    if (!ETHEREUM_ADDRESS_REGEX.test(value) && value.length > 0) {
      setNewRelayValid(false);
    } else setNewRelayValid(true);
  };

  return (
    <>
      <DashboardSingleInputBox
        title="New relayer address"
        description="Add another transaction relayer that will process user progression calls and facilitate meta transactions. Relayer address will be added to your smart contract and existing relayers as well as the default one will remain authorized."
        placeholder="Relayer address"
        stateVar={newRelayAddress}
        isValid={newRelayValid}
        isRequiredField={false}
        disableCondition={false}
        onChange={onRelayAddressChange}
        btnSettings={{
          handler: addRelayer,
          btnText: "Add relayer",
          disabled: !newRelayValid || !newRelayAddress,
        }}
      />
    </>
  );
}
