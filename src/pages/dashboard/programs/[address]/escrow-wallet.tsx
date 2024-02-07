import { useState, useEffect } from "react";
import { type NextPage } from "next";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleLoyaltyPathValidation } from "~/utils/handleServerAuth";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import DashboardPageLoading from "~/components/UI/Dashboard/DashboardPageLoading";
import DashboardInfoBox from "~/components/UI/Dashboard/DashboardInfoBox";
import DashboardPageError from "~/components/UI/Dashboard/DashboardPageError";
import DashboardCopyDataBox from "~/components/UI/Dashboard/DashboardCopyDataBox";
import BeginDepositPeriod from "~/components/UI/Dashboard/Escrow/Wallet/BeginDepositPeriod";
import EscrowTransactionsTable from "~/components/UI/Dashboard/Escrow/Wallet/EscrowTransactionsTable";

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleLoyaltyPathValidation(ctx);
};

const EscrowWallet: NextPage = () => {
  const [isClient, setIsClient] = useState<boolean>(false);
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const {
    data: escrowApprovals,
    isLoading: escrowApprovalsLoading,
    isError: approvalsErr,
  } = api.escrow.getEscrowApprovalsStatus.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress) ?? "",
    },
    { refetchOnWindowFocus: false },
  );

  const {
    data: contractsDb,
    isLoading: contractDbLoading,
    isError: contractsDbErr,
  } = api.escrow.getDepositRelatedData.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress) ?? "",
    },
    { refetchOnWindowFocus: false },
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (escrowApprovalsLoading || contractDbLoading)
    return <DashboardPageLoading />;

  if (contractsDbErr || approvalsErr) {
    return (
      <DashboardPageError message="Error fetching escrow related info. Please try again later." />
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Escrow Wallet"
        info="Manage deposits and balances in your escrow contract"
      />
      {escrowApprovals?.allApprovalsComplete &&
        contractsDb?.escrow?.state === "DepositPeriod" && (
          <DashboardInfoBox
            infoType="success"
            info={`Your deposit period is currently active. Deposit period ends on: ${contractsDb.escrow.depositEndDate?.toLocaleDateString()}`}
          />
        )}

      {(!escrowApprovals?.isRewardApproved ||
        !escrowApprovals.isSenderApproved) && (
        <DashboardInfoBox
          infoType="warn"
          info="You still need to enter your sender address and/or rewards contract address for approval - then you can begin managing deposits"
          outlinkText="Take me to Escrow Approvals"
          outlink={`/dashboard/programs/${loyaltyAddress}/escrow-approvals`}
        />
      )}

      {escrowApprovals?.allApprovalsComplete && contractsDb.escrow && (
        <div className="space-y-8">
          <DashboardCopyDataBox
            title="Your Deposit Key"
            description="Your deposit key for depositing tokens into your escrow contract."
            copyBoxLabel="Deposit Key"
            dataToCopy={contractsDb?.escrow?.depositKey ?? ""}
            copySuccessMessage="Copied deposit key"
            isSecret
            containerBg="bg-neutral-2"
            dataLoading={contractDbLoading}
          />
          <EscrowTransactionsTable />
        </div>
      )}

      {isClient && !escrowApprovals?.isDepositKeySet && <BeginDepositPeriod />}
    </div>
  );
};

// @ts-ignore
EscrowWallet.getLayout = getDashboardLayout;
export default EscrowWallet;
