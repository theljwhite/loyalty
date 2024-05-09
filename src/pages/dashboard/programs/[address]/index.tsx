import React, { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { type GetServerSidePropsContext, type GetServerSideProps } from "next";
import { handleLoyaltyPathValidation } from "~/utils/handleServerAuth";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { RewardType } from "@prisma/client";
import {
  ChecklistIcon,
  ERC1155Icon,
  ERC721Icon,
  EthIcon,
  OutLink,
  WarningIcon,
} from "~/components/UI/Dashboard/Icons";
import { type Url } from "next/dist/shared/lib/router/router";
import { ROUTE_DOCS_QUICKSTART } from "~/configs/routes";
import DashboardStateStatus from "~/components/UI/Dashboard/DashboardStateStatus";
import DashboardAnalyticsStatus from "~/components/UI/Dashboard/DashboardAnalyticsStatus";
import DashboardPageLoading from "~/components/UI/Dashboard/DashboardPageLoading";
import DashboardBreadcrumb from "~/components/UI/Dashboard/DashboardBreadcrumb";
import DashboardInfoBox from "~/components/UI/Dashboard/DashboardInfoBox";
import DashboardPageError from "~/components/UI/Dashboard/DashboardPageError";

//TODO - the JSX can be cleaned up a bit here, lol. all of this component can tbh.
//TODO - styling fixes (clean it up and responsiveness)

type QuickStartOptions = {
  id: number;
  title: string;
  image: JSX.Element;
  color: string;
  rewardType: RewardType;
  selected: boolean;
};

const quickStartOptionsData: QuickStartOptions[] = [
  {
    id: 0,
    title: "Only Points",
    image: <ChecklistIcon size={24} color="currentColor" />,
    color: "bg-cyan-200",
    rewardType: "Points",
    selected: false,
  },
  {
    id: 1,
    title: "ERC20 Rewards",
    image: <EthIcon size={24} color="#48cbd9" />,
    color: "bg-[#37367b]",
    rewardType: "ERC20",
    selected: false,
  },
  {
    id: 2,
    title: "ERC721 Rewards",
    image: <ERC721Icon color="#3b0764" />,
    color: "bg-violet-200",
    rewardType: "ERC721",
    selected: false,
  },
  {
    id: 3,
    title: "ERC1155 Rewards",
    image: <ERC1155Icon color="currentColor" />,
    color: "bg-pink-200",
    rewardType: "ERC1155",
    selected: false,
  },
];

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleLoyaltyPathValidation(ctx);
};

export default function DashboardHome() {
  const [quickStartOptions, setQuickStartOptions] = useState<
    QuickStartOptions[]
  >(quickStartOptionsData);
  const [didSelect, setDidSelect] = useState<boolean>(false);

  const router = useRouter();
  const { address } = router.query;
  const loyaltyAddress = String(address);

  const {
    data: loyaltyProgram,
    isLoading,
    isError,
  } = api.loyaltyPrograms.getBasicLoyaltyDataByAddress.useQuery(
    {
      contractAddress: loyaltyAddress,
    },
    { refetchOnWindowFocus: false },
  );

  const selectQuickStartOption = (id: number): void => {
    const selected = quickStartOptions.map((option) => ({
      ...option,
      selected: option.id === id,
    }));
    setQuickStartOptions(selected);
    setDidSelect(true);
  };

  const getDocRouteForRewardType = (): Url => {
    const selectedOption = quickStartOptions.find((option) => option.selected);
    if (selectedOption || loyaltyProgram?.rewardType) {
      return `${ROUTE_DOCS_QUICKSTART}/${
        selectedOption?.rewardType ?? loyaltyProgram?.rewardType
      }`;
    }
    return ROUTE_DOCS_QUICKSTART;
  };

  if (isLoading) return <DashboardPageLoading />;

  if (!loyaltyProgram || isError) {
    return (
      <DashboardPageError message="Error. This loyalty program does not exist" />
    );
  }

  return (
    <>
      <Head>
        <title>{`Home - ${loyaltyProgram.name}`}</title>
      </Head>
      <div className="space-y-8">
        <div className="relative flex items-center justify-between gap-4">
          <DashboardBreadcrumb
            firstTitle="Home"
            secondTitle={loyaltyProgram.name}
          />
        </div>
        <div className="relative flex items-center justify-between gap-4">
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex w-full max-w-[80ch] flex-col gap-3">
              <div className="w-full space-y-2">
                <h1 className="truncate text-2xl font-medium tracking-tight text-dashboard-body">
                  Home
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="flex flex-col">
            <div className="space-y-8">
              <header className="space-y-1">
                <h2 className="text-lg font-medium text-dashboard-body">
                  Your Loyalty Program is deployed!
                </h2>
                <p className="text-[13px] text-dashboard-lighterText">
                  Learn more below and get started setting up your program
                </p>
              </header>
              <div className="space-y-6 rounded-2xl border border-dashboard-border1 p-6">
                <div className="space-y-1">
                  <h3 className="text-[13px] font-semibold text-dashboard-body">
                    Quickstarts
                  </h3>
                  <p className="text-xs text-dashboard-neutral">
                    Choose your loyalty program type below to get it up and
                    running in no time
                  </p>
                </div>
                <ul className="isolate grid grid-cols-4 gap-1">
                  {quickStartOptions.map((option) => {
                    return (
                      <li key={option.id}>
                        <button
                          onClick={() => selectQuickStartOption(option.id)}
                          className="group relative flex aspect-square w-full items-center justify-center rounded-lg transition"
                        >
                          <div
                            className={`absolute inset-0 rounded-xl ${
                              option.selected ||
                              (option.rewardType ===
                                loyaltyProgram.rewardType &&
                                !didSelect)
                                ? "bg-neutral-100"
                                : "bg-transparent"
                            }`}
                          />
                          <div className="relative z-10 flex flex-col items-center space-y-4">
                            <div className="transition duration-[450ms]">
                              <div
                                className={`${option.color} flex h-12 w-12 items-center justify-center rounded-full p-2`}
                              >
                                {option.image}
                              </div>
                            </div>
                            <span className="font-book text-[13px] leading-none">
                              {option.title}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {quickStartOptions.map((option) => {
                  return (
                    <div key={option.id}>
                      {(option.selected ||
                        (option.rewardType === loyaltyProgram.rewardType &&
                          !didSelect)) && (
                        <div key={option.id}>
                          <div>
                            <p className="text-sm font-medium leading-5">
                              {option.title} Next Steps
                            </p>
                            <div className="mt-2">
                              {loyaltyProgram.escrowAddress ? (
                                loyaltyProgram.stepsNeeded.map(
                                  (item, index) => {
                                    return (
                                      <div key={index}>
                                        <div className="mb-2 flex items-start gap-[0.5rem] rounded-md bg-neutral-2 p-3 text-sm font-[0.8125rem] leading-[1.125rem] text-dashboard-lightGray">
                                          <WarningIcon
                                            size={16}
                                            color="currentColor"
                                          />

                                          <div className="break-word inline-block">
                                            {item.step}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  },
                                )
                              ) : (
                                <div>
                                  <p className="mb-2 text-[13px] font-normal text-dashboard-lightGray">
                                    {option.rewardType === "Points"
                                      ? "Set your loyalty program as active in"
                                      : "You should first deploy and set up your escrow contract in the"}{" "}
                                    <code className="rounded-lg border border-dashboard-codeBorder bg-dashboard-codeBg p-1 pe-[0.3em] ps-[0.3em] text-xs">
                                      {option.rewardType === "Points"
                                        ? "Overview"
                                        : "Escrow Deploy"}
                                    </code>{" "}
                                    tab
                                  </p>

                                  <DashboardInfoBox
                                    infoType="warn"
                                    info={
                                      option.rewardType === "Points"
                                        ? "Next steps are to review your objectives and/or tiers and set your loyalty program to active."
                                        : `Next steps are to deploy your ${option.rewardType} contract, deposit reward tokens, and customize your escrow settings.`
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <Link href={getDocRouteForRewardType()}>
                  <div className="relative my-6 inline-flex h-8 min-w-10 cursor-pointer items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-3 ps-3 align-middle text-sm  text-white outline-none">
                    Continue in docs
                    <div className="ms-2 inline-flex shrink-0 self-center">
                      <span className="mt-1 inline-block h-4 w-4 shrink-0">
                        <OutLink size={12} color="currentColor" />{" "}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <DashboardStateStatus
          programState={loyaltyProgram.state}
          containerBg="bg-transparent"
        />
        <DashboardAnalyticsStatus containerBg="bg-transparent" />
      </div>
    </>
  );
}

// @ts-ignore
DashboardHome.getLayout = getDashboardLayout;
