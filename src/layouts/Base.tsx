import React from "react";
import Nav from "~/components/Navbars/Nav";

interface BaseProps {
  children: React.ReactNode;
}

const Base = (props: BaseProps) => {
  const { children } = props;

  return (
    <>
      <Nav />
      <main className="flex grow flex-col pb-20 md:pb-0">{children}</main>
    </>
  );
};

export const getLayout = (page: any) => <Base>{page}</Base>;
export default Base;
