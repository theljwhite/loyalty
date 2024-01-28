import { useState } from "react";
import { type NextPage } from "next";
import { handleServerAuth } from "~/utils/handleServerAuth";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import DashboardInfoBanner from "~/components/UI/Dashboard/DashboardInfoBanner";
import DashboardSingleInputBox from "~/components/UI/Dashboard/DashboardSingleInputBox";
import DashboardCopyDataBox from "~/components/UI/Dashboard/DashboardCopyDataBox";

//TODO 1/28 - finish this

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleServerAuth(ctx);
};

const EscrowApprovals: NextPage = () => {
  const [senderWalletAddress, setSenderWalletAddress] = useState<string>("");
  const [senderWalletValid, setSenderWalletValid] = useState<boolean>(false);
  const router = useRouter();
  const { address } = router.query;
  const { data: escrowDepositKey, isLoading: keyLoading } =
    api.escrow.getEscrowDepositKey.useQuery(
      { loyaltyAddress: String(address) },
      { refetchOnWindowFocus: false },
    );

  const onSenderChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSenderWalletAddress(e.target.value);
    validateWalletInput(e.target.value);
  };

  const validateWalletInput = (walletAddress: string): boolean => {
    //TODO
    console.log("wallet", walletAddress);
    return false;
  };

  return (
    <div className="space-y-8">
      <DashboardHeader title="Escrow Approvals" />
      <DashboardInfoBanner
        infoType="info"
        info="Some quick approvals are needed to ensure the safety of your loyalty program. Complete the checklist below to get your escrow contract quickly ready to issue rewards."
      />
      <DashboardSingleInputBox
        title="Sender Wallet Address"
        description="Who will be managing your loyalty/escrow contracts and depositing tokens to be rewarded? Defaults to deployer address. This cannot be changed after it is written to the smart contract."
        onChange={(e) => onSenderChange(e)}
        stateVar={senderWalletAddress}
        placeholder="TODO user address here"
        isValid={senderWalletValid}
      />
      <DashboardCopyDataBox
        title="Deposit Key"
        description="This is your deposit key for depositing tokens into your escrow contract"
        copyBoxLabel="Deposit Key"
        dataToCopy={escrowDepositKey ?? ""}
        copySuccessMessage="Copied deposit key"
        isSecret
        containerBg="white"
        showBorder
        dataLoading={keyLoading}
      />
    </div>
  );
};

// @ts-ignore
EscrowApprovals.getLayout = getDashboardLayout;
export default EscrowApprovals;
