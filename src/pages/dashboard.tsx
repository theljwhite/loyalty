import React from "react";
import { useSession } from "next-auth/react";
import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session || session.user.role !== "Creator") {
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

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div>
      {/* TODO */}
      <h1>Dashboard</h1>
      <span>User: {session?.user.id}</span>
      <span>Role: {session?.user.role}</span>
    </div>
  );
}
