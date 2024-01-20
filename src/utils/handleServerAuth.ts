import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "~/server/auth";

export const handleServerAuth = async (ctx: GetServerSidePropsContext) => {
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
