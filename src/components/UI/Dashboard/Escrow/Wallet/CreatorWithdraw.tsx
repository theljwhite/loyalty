import { useState } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useDepositRewardsStore } from "~/customHooks/useDepositRewards/store";
import { type EscrowType } from "@prisma/client";
import { ensureSameChain } from "~/utils/ensureSameChain";
import { NUMBERS_OR_FLOATS_ONLY_REGEX } from "~/constants/regularExpressions";
import DashboardSimpleInputModal from "../../DashboardSimpleInputModal";
import {
  toastSuccess,
  toastLoading,
  toastError,
} from "~/components/UI/Toast/Toast";
import useContractAccount from "~/customHooks/useContractAccount";

//TODO error handle
//add confirmation modal to withdraw all

interface CreatorWithdrawProps {
  escrowAddress: string;
  escrowType: EscrowType;
  chainId: number;
}

export default function CreatorWithdraw({
  escrowAddress,
  escrowType,
  chainId,
}: CreatorWithdrawProps) {
  const [erc20Amount, setERC20Amount] = useState<string>("");
  const [erc20AmountValid, setERC20AmountValid] = useState<boolean>(false);

  const [isAmountModalOpen, setIsAmountModalOpen] = useState<boolean>(false);

  const { setIsSuccess } = useDepositRewardsStore((state) => state);
  const { creatorWithdrawERC20, creatorWithdrawAll } = useContractAccount(
    escrowAddress,
    escrowType,
    chainId,
  );

  const { isConnected, address: userConnectedAddress } = useAccount();
  const { openConnectModal } = useConnectModal();

  const handleWithdrawWithAmount = async (): Promise<void> => {
    setIsSuccess(false);
    toastLoading("Withdraw request sent to wallet", true);
    try {
      const incorrectChainMsg = await ensureSameChain(chainId);

      if (incorrectChainMsg) {
        return toastError(incorrectChainMsg);
      }

      const tx = await creatorWithdrawERC20(erc20Amount);

      if (tx.status === "reverted") throw new Error();

      setIsAmountModalOpen(false);
      toastSuccess(`Successfully withdrew ${erc20Amount} tokens from escrow.`);
      setIsSuccess(true);
      setERC20Amount("");
    } catch (error) {
      toastError("Withdrawal failed. Please try again later.");
    }
  };

  const handleWithdrawAll = async (): Promise<void> => {
    setIsSuccess(false);
    toastLoading("Withdraw request sent to wallet", true);
    try {
      const incorrectChainMsg = await ensureSameChain(chainId);

      if (incorrectChainMsg) {
        return toastError(incorrectChainMsg);
      }

      const tx = await creatorWithdrawAll();

      if (tx.status === "reverted") throw new Error();

      toastError(`Successfully withdrew remaining escrow balance.`);
      setIsSuccess(true);
    } catch (error) {
      toastError("Withdrawal all failed. Please try again later.");
    }
  };

  const onWithdrawAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const { value } = e.target;
    setERC20Amount(value);

    if (!NUMBERS_OR_FLOATS_ONLY_REGEX.test(value) && value.length > 0) {
      setERC20AmountValid(false);
    } else setERC20AmountValid(true);
  };

  return (
    <>
      {isAmountModalOpen && (
        <DashboardSimpleInputModal
          modalTitle="Withdraw ERC20 Amount"
          modalDescription="Withdraw a specific ERC20 amount from your escrow contract balance"
          inputLabel="Amount"
          inputPlaceholder="eg 2 or 0.2"
          inputState={erc20Amount}
          inputHelpMsg="You may need to top up on native tokens to cover minor gas fees when withdrawing."
          inputOnChange={onWithdrawAmountChange}
          inputDisabled={false}
          inputValid={erc20AmountValid}
          inputInstruction="Enter an amount of tokens to withdraw."
          btnTitle="Withdraw"
          btnDisabled={!erc20AmountValid || !erc20Amount}
          onActionBtnClick={handleWithdrawWithAmount}
          setIsModalOpen={setIsAmountModalOpen}
        />
      )}

      {escrowType === "ERC20" && (
        <button
          type="button"
          onClick={
            isConnected && userConnectedAddress
              ? () => setIsAmountModalOpen(true)
              : openConnectModal
          }
          className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-3 ps-3 align-middle text-sm font-semibold leading-[1.2] text-white outline-none"
        >
          Withdraw Amount
        </button>
      )}

      <button
        type="button"
        onClick={
          isConnected && userConnectedAddress
            ? handleWithdrawAll
            : openConnectModal
        }
        className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-3 ps-3 align-middle text-sm font-semibold leading-[1.2] text-white outline-none"
      >
        Withdraw All
      </button>
    </>
  );
}
