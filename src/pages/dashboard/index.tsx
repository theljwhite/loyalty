import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { type GetServerSidePropsContext, type GetServerSideProps } from "next";
import { handleServerAuth } from "~/utils/handleServerAuth";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { AddIcon, CoinsOne } from "~/components/UI/Dashboard/Icons";
import Head from "next/head";
import Link from "next/link";
import DashboardPageLoading from "~/components/UI/Dashboard/DashboardPageLoading";
import DashboardHeader from "~/components/UI/Dashboard/DashboardHeader";

//TODO 1/9 - make tailwind or reusable components for dashboard input fields, text areas, etc.

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleServerAuth(ctx);
};

const Dashboard: NextPage = (props) => {
  const { data: session } = useSession();
  const { data: loyaltyPrograms, isLoading } =
    api.loyaltyPrograms.getAllProgramsBasicInfo.useQuery(
      {
        creatorId: session?.user.id ?? "",
      },
      { refetchOnWindowFocus: false },
    );
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Dashboard - {session?.user.name} </title>
      </Head>
      <DashboardHeader title="Loyalty Programs" />
      {isLoading ? (
        <DashboardPageLoading />
      ) : (
        <div className="mt-9 grid auto-rows-fr grid-cols-1 gap-10 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <button
            onClick={() => router.push("/dashboard/create")}
            type="button"
            className="h-full min-h-[300px] w-full place-items-center space-y-2 rounded-2xl border text-center transition hover:border-gray-300 focus:shadow-none"
          >
            <span className="mx-auto flex justify-center text-gray-500">
              <AddIcon size={12} color="currentColor" />
            </span>
            <span className="mb-1 mt-2 text-sm">Create Loyalty Program</span>
          </button>
          {loyaltyPrograms &&
            loyaltyPrograms.map((program) => {
              return (
                <Link
                  key={program.id}
                  href={`/dashboard/programs/${program.address}`}
                >
                  <div className="relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white [transition:all_150ms_ease_0s] hover:shadow-md hover:shadow-gray-200">
                    <div className="flex h-[164px] items-center justify-center bg-primary-1 p-4">
                      <p className="mb-0 overflow-hidden overflow-ellipsis text-center text-sm font-normal leading-5 text-[white]">
                        {program.name}
                      </p>
                    </div>
                    <div className="flex flex-[1_0_auto] flex-col items-start p-4">
                      <div className="flex flex-col">
                        <p className="mb-0.5 overflow-hidden overflow-ellipsis text-sm font-medium leading-5 text-black">
                          {program.name}
                        </p>
                        <span className="static mt-0.5 text-xs font-medium leading-5 text-primary-1">
                          {program.chain}: {program.address}
                        </span>
                        <p className="mt-0.5 text-xs font-normal leading-5 text-dashboard-lightGray">
                          Updated at {program.updatedAt.toLocaleDateString()},
                          {program.updatedAt.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="mt-6 flex flex-[1_0_auto] flex-col">
                        <div className="flex items-center">
                          <div className="mr-1.5 h-2 w-2 rounded-full bg-success-1"></div>
                          <p className="text-xs font-normal leading-5 text-dashboard-lightGray">
                            Idle
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 flex flex-row gap-2 whitespace-nowrap rounded bg-violet-50 px-2 py-0.5 align-middle text-xs font-normal text-black text-primary-1">
                        <CoinsOne size={13} color="currentColor" />
                        {program.rewardType}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      )}
    </>
  );
};

// @ts-ignore
Dashboard.getLayout = getDashboardLayout;
export default Dashboard;
