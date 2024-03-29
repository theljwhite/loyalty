import { useState } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { api } from "~/utils/api";
import DashboardSimpleInputModal from "../../DashboardSimpleInputModal";
import { CoinsOne } from "../../Icons";
import useDepositRewards from "~/customHooks/useDepositRewards/useDepositRewards";
import { useDepositRewardsStore } from "~/customHooks/useDepositRewards/store";
import DashboardModalStatus from "../../DashboardModalStatus";
import DashboardSummaryTable from "../../DashboardSummaryTable";

//TODO - validate user connected to deployed loyalty program chain
//prob need to make a global util for this

export default function DepositERC20() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const {
    isSuccess,
    isDepositReceiptOpen,
    erc20DepositAmount,
    depositReceipt,
    setERC20DepositAmount,
    setIsDepositReceiptOpen,
  } = useDepositRewardsStore((state) => state);

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { data: contractsDb } = api.escrow.getDepositRelatedData.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress) ?? "",
    },
    { refetchOnWindowFocus: false },
  );
  const { handleApproveAndDeposit } = useDepositRewards(
    contractsDb?.escrow?.rewardAddress ?? "",
    contractsDb?.escrow?.address ?? "",
    contractsDb?.loyaltyProgram?.chainId ?? 0,
  );

  const handleAmountChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const { value } = e.target;
    setERC20DepositAmount(value);
  };

  const handleDeposit = async (): Promise<void> => {
    setIsDepositModalOpen(false);
    await handleApproveAndDeposit();
  };

  return (
    <>
      {isConnected && address ? (
        <button
          type="button"
          onClick={() => setIsDepositModalOpen(true)}
          className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-3 ps-3 align-middle text-sm font-semibold leading-[1.2] text-white outline-none"
        >
          <span className="me-2 inline-flex shrink-0 self-center">
            <CoinsOne size={16} color="currentColor" />
          </span>
          Deposit ERC20
        </button>
      ) : (
        <button
          type="button"
          onClick={openConnectModal}
          className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-3 ps-3 align-middle text-sm font-semibold leading-[1.2] text-white outline-none"
        >
          Connect Wallet
        </button>
      )}
      {isDepositModalOpen && (
        <DashboardSimpleInputModal
          modalTitle="Make ERC20 Deposit"
          modalDescription="Deposit your approved ERC20 reward tokens into your escrow contract"
          inputLabel="Deposit Amount"
          inputOnChange={handleAmountChange}
          inputHelpMsg="Deposited tokens will remain locked in escrow until loyalty program has concluded or tokens have been rewarded"
          inputState={erc20DepositAmount}
          inputInstruction="Enter the amount of tokens that you wish to deposit"
          inputPlaceholder="ie: 0.20"
          inputDisabled={false}
          inputValid={true}
          btnTitle="Deposit My Tokens"
          btnDisabled={false}
          onActionBtnClick={handleDeposit}
          bannerInfo="Learn more about deposits and how tokens are managed"
          setIsModalOpen={setIsDepositModalOpen}
        />
      )}
      {isSuccess && isDepositReceiptOpen && (
        <DashboardModalStatus
          title="Deposit successful"
          description="Your ERC20 deposit into escrow contract was successful."
          status="success"
          setIsModalOpen={setIsDepositReceiptOpen}
          additionalStyling={
            <DashboardSummaryTable
              title="Transaction details"
              dataObj={{
                hash: depositReceipt.hash,
                gasCost: depositReceipt.gasPrice.toString(),
                gasUsed: depositReceipt.gasUsed.toString(),
                depositedAmount: erc20DepositAmount,
              }}
            />
          }
        />
      )}
    </>
  );
}
