import { type NextPage } from "next";
import { handleServerAuth } from "~/utils/handleServerAuth";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import DashboardInfoBanner from "~/components/UI/Dashboard/DashboardInfoBanner";
import EscrowApprovalsForm from "~/components/UI/Dashboard/Escrow/Approvals/EscrowApprovalsForm";

//TODO - make address that loyalty contract was deployed from the default placeholder...
//...for the Sender Wallet input field
//TODO 1/29 - finish

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleServerAuth(ctx);
};

const EscrowApprovals: NextPage = () => {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Escrow Approvals" />
      <DashboardInfoBanner
        infoType="info"
        info="Some quick approvals are needed to ensure the safety of your loyalty program. Complete the checklist below to get your escrow contract quickly ready to issue rewards."
      />
      <EscrowApprovalsForm />
    </div>
  );
};

// @ts-ignore
EscrowApprovals.getLayout = getDashboardLayout;
export default EscrowApprovals;
