import { type Session } from "next-auth";
import { type ReactNode } from "react";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chains, configForWagmi } from "~/configs/wagmi";
import { api } from "~/utils/api";
import { customRainbowTheme } from "~/configs/rainbowkit";
import { ToastContainer } from "react-toastify";
import Base from "~/layouts/Base";
import "node_modules/@rainbow-me/rainbowkit/dist/index.css";
import "~/styles/globals.css";
import "react-toastify/dist/ReactToastify.min.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  //@ts-ignore
  const getLayout = Component.getLayout ?? ((page: any) => <Base>{page}</Base>);

  return (
    <>
      <Head>
        <title>loyalty</title>
        <meta
          name="description"
          content={process.env.NEXT_PUBLIC_PROJECT_NAME}
        />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="prefetch"
          href="/Lunchtype22-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </Head>

      <SessionProvider session={session}>
        <WagmiConfig config={configForWagmi}>
          <RainbowKitProvider
            chains={chains}
            theme={customRainbowTheme}
            modalSize="wide"
          >
            {getLayout(<Component {...pageProps} />)}
            <ToastContainer
              autoClose={4000}
              position="bottom-center"
              hideProgressBar
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              pauseOnHover
              draggable
              theme="light"
              bodyClassName={() =>
                "flex items-center text-base text-dashboard-heading"
              }
            />
          </RainbowKitProvider>
        </WagmiConfig>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
