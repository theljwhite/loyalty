import { type NextPage } from "next";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { useRouter } from "next/router";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleLoyaltyPathValidation } from "~/utils/handleServerAuth";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import RegisterEntitySecret from "~/components/UI/Dashboard/Developers/RegisterEntitySecret";

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleLoyaltyPathValidation(ctx);
};

const DevConsole: NextPage = () => {
  return (
    <div className="space-y-8">
      <DashboardHeader title="Developer Console" />
      <RegisterEntitySecret />
    </div>
  );
};

// @ts-ignore
DevConsole.getLayout = getDashboardLayout;
export default DevConsole;
