import { type ReactNode } from "react";
import { getLayout } from "./Base";

interface LayoutCenterProps {
  children: React.ReactNode;
}

const LayoutCenter = (props: LayoutCenterProps) => {
  const { children } = props;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center pb-4 pt-10 font-lunch md:pb-0 md:pt-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(238.39deg,#9F39CC 1.59%,#8542d8 22.32%,#5639CC 65.8%,#3966CC 102.16%)",
        }}
      />
      {children}
    </div>
  );
};

export const getLayoutCenter = (page: ReactNode) => {
  return getLayout(<LayoutCenter>{page}</LayoutCenter>);
};
