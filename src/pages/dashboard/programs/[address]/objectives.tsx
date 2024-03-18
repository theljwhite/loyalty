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

  const testLoyaltyCall = async (): Promise<void> => {
    const response = await fetch("/api/relay/Mumbai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-loyalty-api-key": "testApiKey",
        "x-loyalty-entity-secret": "testSecret",
        "x-loyalty-version": "0.0.1",
        "x-loyalty-be-adapter": "server-sdk",
      },
      body: JSON.stringify({
        userWalletAddress: "0xtest",
        loyaltyContractAddress: String(loyaltyAddress),
        objectiveIndex: 0,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log("error", error);
    }

    if (response.ok) {
      const data = await response.json();
      console.log("data", data);
    }

    console.log("res -->", response);
  };

  return (
    <div className="space-y-8">
      <DashboardHeader title="Objectives Test" info="TODO" />
      <DashboardActionButton
        onClick={testLoyaltyCall}
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
