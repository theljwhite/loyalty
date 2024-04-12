import { type NextPage } from "next";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleLoyaltyPathValidation } from "~/utils/handleServerAuth";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import CreatorApiKeys from "~/components/UI/Dashboard/Developers/CreatorApiKeys";
import EntitySecret from "~/components/UI/Dashboard/Developers/EntitySecret";

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleLoyaltyPathValidation(ctx);
};

const ApiKeys: NextPage = () => {
  return (
    <div className="space-y-8">
      <DashboardHeader
        title="API Keys"
        info="Manage your API keys for this loyalty program"
      />
      <CreatorApiKeys />
      <EntitySecret />
    </div>
  );
};

// @ts-ignore
ApiKeys.getLayout = getDashboardLayout;
export default ApiKeys;
