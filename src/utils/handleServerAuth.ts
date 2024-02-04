import { GetServerSidePropsResult, type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

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

export const handleLoyaltyPathValidation = async (
  ctx: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<{ [key: string]: any }>> => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  const userAddressPaths: string[] = [];
  const userLoyaltyAddresses = await db.loyaltyProgram.findMany({
    where: { creatorId: session?.user.id },
    select: { address: true },
  });

  for (const { address } of userLoyaltyAddresses)
    userAddressPaths.push(address);

  if (!userAddressPaths.includes(String(ctx?.params?.address ?? ""))) {
    return {
      notFound: true,
    };
  }
  return { props: { session } };
};
