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

  const testSmartAccount = async (): Promise<void> => {
    const objectiveIndex = 0;
    const testUserAddress = "0x683caf01F3C2835171349FF7A176d8892ab9511D";
    // const result = await testSmartAccountCompleteObjective(
    //   objectiveIndex,
    //   testUserAddress,
    //   String(loyaltyAddress),
    // );

    // console.log("hash -->", result.hash);
    // console.log("user op receipt -->", result.receipt);
  };

  // const testBiconomyWhiteListAddress = async (): Promise<void> => {
  //   try {
  //     const response = await fetch("/api/biconomy/biconomyWhitelist", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         destinationAddresses: [String(loyaltyAddress)],
  //       }),
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log("data -->", data);
  //     }
  //   } catch (error) {
  //     console.error("error from FE -->", error);
  //   }
  // };

  const testOpenZeppelin = async (): Promise<void> => {
    const testUserAddress = "0x683caf01F3C2835171349FF7A176d8892ab9511D";
    try {
      const receipt = await fetch("/api/openzeppelin/relay/Mumbai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectiveIndex: 0,
          userAddress: testUserAddress,
          loyaltyAddress: String(loyaltyAddress),
          creatorAddress: "0xe63DC839fA2a6A418Af4B417cD45e257dD76f516",
          apiKey: "TODO",
        }),
      });

      console.log("from fe -->", receipt);
    } catch (error) {
      console.error("error from fe -->", error);
    }
  };

  const testCreateWalletSet = async (): Promise<void> => {
    try {
      const response = await fetch("/api/wallet/create-wallet-set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loyaltyAddress: "0x2Df0edfaE35AA3c17203818440F8F63680274C48",
          chainId: 80001,
        }),
      });
      console.log("response from fe -->", response);
    } catch (error) {
      console.error("error from fe -->", error);
    }
  };

  const testCircleAuth = async (): Promise<void> => {
    try {
      const response = await fetch("/api/wallet/gen-c-t", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lol: "lmao",
        }),
      });
      console.log("r fe", response);
    } catch (error) {
      console.error("e from auth", error);
    }
  };

  return (
    <div className="space-y-8">
      <DashboardHeader title="Objectives Test" info="TODO" />
      <DashboardActionButton
        onClick={testCreateWalletSet}
        btnText="Do stuff"
        isPrimary
      />
      <DashboardActionButton
        onClick={testOpenZeppelin}
        btnText="Test Smart Account"
        isPrimary={false}
      />
    </div>
  );
};

// @ts-ignore
Objectives.getLayout = getDashboardLayout;
export default Objectives;
