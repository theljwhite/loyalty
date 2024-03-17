import { InferGetServerSidePropsType, type NextPage } from "next";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleLoyaltyPathValidation } from "~/utils/handleServerAuth";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import CreatorApiKeys from "~/components/UI/Dashboard/Developers/CreatorApiKeys";

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
        info="Manage your api keys for this loyalty program"
      />
      <CreatorApiKeys />
    </div>
  );
};

// @ts-ignore
ApiKeys.getLayout = getDashboardLayout;
export default ApiKeys;
