import React from "react";
import { useSession } from "next-auth/react";
import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";
import { getDashboardLayout } from "~/layouts/LayoutDashboard";
import { type NextPage } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: "/signin",
      },
      props: { session },
    };
  }

  return {
    props: { session },
  };
};

const Dashboard: NextPage = (props) => {
  const { data: session } = useSession();

  return (
    <div>
      {/* TODO */}
      <h1>Dashboard</h1>
      <span>User: {session?.user.id}</span>
      <span>Role: {session?.user.role}</span>
    </div>
  );
};

// @ts-ignore
Dashboard.getLayout = getDashboardLayout;
export default Dashboard;
