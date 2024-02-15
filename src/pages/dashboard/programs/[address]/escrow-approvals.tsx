import { type NextPage } from "next";
import { handleLoyaltyPathValidation } from "~/utils/handleServerAuth";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleLoyaltyPathValidation(ctx);
};

const EscrowApprovals: NextPage = () => {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Escrow Approvals" />
      TODO
    </div>
  );
};

// @ts-ignore
EscrowApprovals.getLayout = getDashboardLayout;
export default EscrowApprovals;
