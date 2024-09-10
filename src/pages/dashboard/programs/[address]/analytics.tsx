import { type NextPage } from "next";
import { handleLoyaltyPathValidation } from "~/utils/handleServerAuth";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import AnalyticsSummary from "~/components/UI/Dashboard/Analytics/AnalyticsSummary";
import WalletStats from "~/components/UI/Dashboard/Analytics/WalletStats";

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleLoyaltyPathValidation(ctx);
};

const Analytics: NextPage = () => {
  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Analytics Summary"
        info="Aggregate analytics for your loyalty program"
      />
      <AnalyticsSummary />
      <WalletStats />
    </div>
  );
};

// @ts-ignore
Analytics.getLayout = getDashboardLayout;
export default Analytics;
