import React from "react";

interface BaseProps {
  children: React.ReactNode;
}

const Base = (props: BaseProps) => {
  const { children } = props;

  return <>{/* TODO */}</>;
};

export const getLayout = (page: any) => <Base>{page}</Base>;
export default Base;
