import React from "react";
import { type NextPage } from "next";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { handleServerAuth } from "~/utils/handleServerAuth";
import CreateStepper from "~/components/CreateLoyalty/CreateStepper";
import CreateProgramName from "~/components/CreateLoyalty/CreateProgramName";
import CreateObjectives from "~/components/CreateLoyalty/CreateObjectives";
import CreateTiers from "~/components/CreateLoyalty/CreateTiers";
import CreateRewardType from "~/components/CreateLoyalty/CreateRewardType";
import CreateProgramEnd from "~/components/CreateLoyalty/CreateProgramEnd";
import CreateDeploy from "~/components/CreateLoyalty/CreateDeploy";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import DashboardInfoBanner from "~/components/UI/Dashboard/DashboardInfoBanner";
import { ContractFactoryWrapper } from "~/customHooks/useContractFactory";

export type CreationStep = {
  id: number;
  title: string;
  content: JSX.Element;
};

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleServerAuth(ctx);
};

const Create: NextPage = () => {
  const creationSteps: CreationStep[] = [
    { id: 0, title: "Name", content: <CreateProgramName /> },
    { id: 1, title: "Objectives", content: <CreateObjectives /> },
    { id: 2, title: "Tiers", content: <CreateTiers /> },
    { id: 3, title: "Reward Type", content: <CreateRewardType /> },
    { id: 4, title: "End Date", content: <CreateProgramEnd /> },
    { id: 5, title: "Deploy", content: <CreateDeploy /> },
  ];

  return (
    <>
      <ContractFactoryWrapper>
        <div className="space-y-8">
          <DashboardHeader
            title="Create Loyalty Program"
            info="Create and deploy your custom loyalty program smart contract"
          />
          <DashboardInfoBanner
            infoType="read"
            info="Learn about how your smart contract will work or read our
            documentation for help."
          />
          <CreateStepper steps={creationSteps} />
        </div>
      </ContractFactoryWrapper>
    </>
  );
};

// @ts-ignore
Create.getLayout = getDashboardLayout;
export default Create;
