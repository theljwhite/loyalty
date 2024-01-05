import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chains, configForWagmi } from "~/configs/wagmi";
import { api } from "~/utils/api";
import "node_modules/@rainbow-me/rainbowkit/dist/index.css";

//TEMP
import LandingNav from "~/components/Navbars/LandingNav";

import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <WagmiConfig config={configForWagmi}>
        <RainbowKitProvider chains={chains} modalSize="compact">
          <LandingNav />
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
