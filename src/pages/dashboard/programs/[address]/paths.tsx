import { type NextPage } from "next";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { useRouter } from "next/router";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleLoyaltyPathValidation } from "~/utils/handleServerAuth";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import CreatorPaths from "~/components/UI/Dashboard/Developers/CreatorPaths";

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleLoyaltyPathValidation(ctx);
};

const Paths: NextPage = () => {
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Paths"
        info="Configure paths from your website or app where objectives may be completed by users"
      />
      <CreatorPaths />
    </div>
  );
};

// @ts-ignore
Paths.getLayout = getDashboardLayout;
export default Paths;
