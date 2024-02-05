import { useState, useEffect } from "react";
import { type NextPage } from "next";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleLoyaltyPathValidation } from "~/utils/handleServerAuth";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import DashboardInfoBanner from "~/components/UI/Dashboard/DashboardInfoBanner";
import DashboardPageLoading from "~/components/UI/Dashboard/DashboardPageLoading";
import BeginDepositPeriod from "~/components/UI/Dashboard/Escrow/BeginDepositPeriod";

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleLoyaltyPathValidation(ctx);
};

const EscrowWallet: NextPage = () => {
  const [isClient, setIsClient] = useState<boolean>(false);
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { data: escrowApprovals, isLoading: escrowApprovalsLoading } =
    api.escrow.getEscrowApprovalsStatus.useQuery(
      {
        loyaltyAddress: String(loyaltyAddress) ?? "",
      },
      { refetchOnWindowFocus: false },
    );

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (escrowApprovalsLoading) return <DashboardPageLoading />;

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Escrow Wallet"
        info="Manage deposits and balances in your escrow contract"
      />
      {isClient && !escrowApprovals?.allApprovalsComplete && (
        <BeginDepositPeriod />
      )}
    </div>
  );
};

// @ts-ignore
EscrowWallet.getLayout = getDashboardLayout;
export default EscrowWallet;
