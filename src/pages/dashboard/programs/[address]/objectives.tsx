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

  const testLoyaltyCall = async (): Promise<void> => {
    const response = await fetch("/api/relay/80001", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-loyalty-api-key":
          "HN_TEST:085fc18d55358d955c0df35a841f20da:56269848a1044ebd2eeb4eda1008b301e2432f6ee4eda842931ef765907d0778",
        "x-loyalty-entity-secret":
          "42126c288c3dc7a2fed2316a266bd731edab25785052c4b22e18468d779845bf",
        "x-loyalty-version": "0.0.1",
        "x-loyalty-be-adapter": "server-sdk",
        "x-loyalty-address": String(loyaltyAddress),
        "x-idempotency-key": window.crypto.randomUUID(),
      },
      body: JSON.stringify({
        // userWalletAddress: "0xe63DC839fA2a6A418Af4B417cD45e257dD76f516",
        // userId: "44ab115e-109a-434a-bf4c-77bdc2ac8b07",
        // userId: "8a8460a8-c85f-4e98-86c9-36b5263efcc0",
        // userId: "3059f649-0a85-4420-851c-0311a44a26c3",
        userId: "0e7607be-7d7b-4ad2-b39a-6d1e56c94405",
        objectiveIndex: 1,
        entitySecretCipherText:
          "i3jP5NPQGFC333kV1VRqQ2YW4EWlxpUNJySAxqdO4nuiJXtA1vwhiolQtqQmDW3u8lELLVEGk/D07CwV55tKqEWAWoCamaJd3arc6NkjGU9v7VZfHyyDXQMvPnhylKOEUcA0ZppXS7kIMF8wn0Ktl9tY1dvp1EGJ3nnSUBA+tvk4RTuMcpQ08xZUUG3ZU9YEqowLMy2gjou/hetnLXNbNMoFGfrdGgI3O9dxyMooLAOW9oHlsg6jC4uYGYwwIY2lm+slOslbqUyxKorHZ2OCbNfN01OXu2vL0tcO/7G46GMHb98vKoxML2TZKEsiGXj0HJk82teivNHEFFYRlYzxHVIepPuSGL/HSnUj2CFkaZdiZmhCcvva0LGlmX9tMzrrGv7w7FOfNsQ8I9z+0hJ+78MPtwJgSW2j41hXUxFO3ShZ/rjJb/Unk66bvqbiXq7Jk6iLBPAi2MsZd13+i/lWnNNyCKf3MMJloIwP5oKpxQ2vTNcPpwJAV4t/7QiCJdrsyJ2600etklxQaNErSm+gStW60MXSGLeSKrflvHMsKmmryaDtre5nOBAcvoHsak5nLxTxvHoX1JNd04RSmPZqoUN3MkRY5JbSsysT6Khs/y44vjXML+44ZmDx5x7uep7kpuhjPN/t4ZktGdHDYOvapEG1HuusOF1YYcqun161T7w=",
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
      <button onClick={testLoyaltyCall}>CLICKKKKKKKKKK</button>
      <DashboardHeader title="Objectives Test" info="TODO" />
    </div>
  );
};

// @ts-ignore
Objectives.getLayout = getDashboardLayout;
export default Objectives;
