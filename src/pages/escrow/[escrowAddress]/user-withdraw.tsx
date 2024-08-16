import { type NextPage } from "next";
import { handleEscrowPathValidation } from "~/utils/handleServerAuth";
import { type GetServerSideProps, GetServerSidePropsContext } from "next";
import { type EscrowPathProps } from "~/utils/handleServerAuth";
import { getLayoutCenter } from "~/layouts/LayoutCenter";
import UserWithdraw from "~/components/UI/Dashboard/User/UserWithdraw";

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
) => {
  return handleEscrowPathValidation(ctx);
};

const EscrowUserWithdraw: NextPage<EscrowPathProps> = ({ program }) => {
  return (
    <>
      <UserWithdraw program={program} />; lol
    </>
  );
};

// @ts-ignore
EscrowUserWithdraw.getLayout = getLayoutCenter;
export default EscrowUserWithdraw;
