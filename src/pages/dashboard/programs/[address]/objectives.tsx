import { type NextPage } from "next";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { useRouter } from "next/router";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleLoyaltyPathValidation } from "~/utils/handleServerAuth";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import DashboardActionButton from "~/components/UI/Dashboard/DashboardActionButton";

//TODO - this is temporary just to test smart accounts.
//objectives wont actually be completed from here.
//at least user authority objectives wont be.

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
      <DashboardActionButton
        // onClick={testCreateWalletSet}
        btnText="Do stuff"
        isPrimary
      />
      <DashboardActionButton
        // onClick={testOpenZeppelin}
        btnText="Test Smart Account"
        isPrimary={false}
      />
    </div>
  );
};

// @ts-ignore
Objectives.getLayout = getDashboardLayout;
export default Objectives;
