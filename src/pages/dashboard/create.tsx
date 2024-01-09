import React from "react";
import { type NextPage } from "next";
import Link from "next/link";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import CreateStepper from "~/components/CreateLoyalty/CreateStepper";
import CreateProgramName from "~/components/CreateLoyalty/CreateProgramName";
import CreateObjectives from "~/components/CreateLoyalty/CreateObjectives";
import CreateTiers from "~/components/CreateLoyalty/CreateTiers";
import CreateRewardType from "~/components/CreateLoyalty/CreateRewardType";
import CreateProgramEnd from "~/components/CreateLoyalty/CreateProgramEnd";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";
import { ReadIcon } from "~/components/UI/Dashboard/Icons";
import { ROUTE_DOCS_MAIN } from "~/configs/routes";

export type CreationStep = {
  id: number;
  title: string;
  content: JSX.Element;
};

const Create: NextPage = (props) => {
  const creationSteps: CreationStep[] = [
    { id: 0, title: "Name", content: <CreateProgramName /> },
    { id: 1, title: "Objectives", content: <CreateObjectives /> },
    { id: 2, title: "Tiers", content: <CreateTiers /> },
    { id: 3, title: "Reward Type", content: <CreateRewardType /> },
    { id: 4, title: "End Date", content: <CreateProgramEnd /> },
    { id: 5, title: "Deploy", content: <div>TODO</div> },
  ];

  return (
    <>
      <DashboardHeader
        title="Create Loyalty Program"
        info="Create and deploy your custom loyalty program smart contract"
      />
      <div className="mb-8 flex items-start gap-[0.5rem] rounded-md bg-neutral-2 p-3 text-sm font-[0.8125rem] leading-[1.125rem] text-dashboard-lightGray">
        <span className="text-neutral-3">
          <ReadIcon size={14} color="currentColor" />
        </span>
        <div className="break-word inline-block">
          Learn about how your smart contract will work or read our
          documentation for help.{" "}
          <Link
            href={ROUTE_DOCS_MAIN}
            className="cursor-pointer text-primary-1"
          >
            View docs
          </Link>
        </div>
      </div>
      <CreateStepper steps={creationSteps} />
    </>
  );
};

// @ts-ignore
Create.getLayout = getDashboardLayout;
export default Create;
