import { type NextPage } from "next";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleLoyaltyPathValidation } from "~/utils/handleServerAuth";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import ManageSingleUser from "~/components/UI/Dashboard/User/ManageSingleUser";

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleLoyaltyPathValidation(ctx);
};

const UserManage: NextPage = () => {
  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Manage User"
        info="View and manage a specific user directly from your loyalty program smart contract"
      />
      <ManageSingleUser />
    </div>
  );
};

// @ts-ignore
UserManage.getLayout = getDashboardLayout;
export default UserManage;
