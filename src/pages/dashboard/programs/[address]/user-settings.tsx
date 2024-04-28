import { type NextPage } from "next";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleLoyaltyPathValidation } from "~/utils/handleServerAuth";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import DashboardInfoBanner from "~/components/UI/Dashboard/DashboardInfoBanner";
import WalletSetSettings from "~/components/UI/Dashboard/User/WalletSetSettings";
import WalletStats from "~/components/UI/Dashboard/User/WalletStats";
import AggregateAnalytics from "~/components/UI/Dashboard/User/AggregateAnalytics";

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleLoyaltyPathValidation(ctx);
};

const UserSettings: NextPage = () => {
  return (
    <div className="space-y-8">
      <DashboardHeader
        title="User Settings"
        info="Manage global user-based settings for your loyalty program's users"
      />
      <DashboardInfoBanner
        infoType="warn"
        info="Learn more about wallet sets and how to support your non-crypto savvy users in your loyalty program before you make any changes."
      />
      <WalletSetSettings />
      <WalletStats />
      <AggregateAnalytics />
    </div>
  );
};

// @ts-ignore
UserSettings.getLayout = getDashboardLayout;
export default UserSettings;
