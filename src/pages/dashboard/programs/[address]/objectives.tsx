import { type NextPage } from "next";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { useRouter } from "next/router";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleLoyaltyPathValidation } from "~/utils/handleServerAuth";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import { thisWillBeDeleted } from "~/utils/encryption";

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleLoyaltyPathValidation(ctx);
};

const Objectives: NextPage = () => {
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  return (
    <div className="space-y-8">
      <DashboardHeader title="Objectives Test" info="TODO" />
    </div>
  );
};

// @ts-ignore
Objectives.getLayout = getDashboardLayout;
export default Objectives;
