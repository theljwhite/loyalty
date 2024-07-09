import { signIn } from "next-auth/react";
import { useAccount, useSignMessage, useNetwork } from "wagmi";
import { useAuthRequestChallengeEvm } from "@moralisweb3/next";
import Moralis from "moralis";

//TODO - FINISH this (decide how want to handle moralis auth with db auth)

export function useWalletAuth() {
  const { signMessageAsync } = useSignMessage();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { requestChallengeAsync } = useAuthRequestChallengeEvm();

  const handleWalletAuth = async (): Promise<void> => {
    try {
      const { message } = (await requestChallengeAsync({
        address: address as `0x${string}`,
        chainId: chain?.id ?? 0,
      })) as { message: string };

      const signature = await signMessageAsync({
        message,
      });

      if (!Moralis.Core.isStarted) {
        await Moralis.start({
          apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
        });
      }

      const response = await Moralis.Auth.verify({
        message,
        signature,
        network: "evm",
      });

      // await signIn("email"); //TODO - turn email into "address" (wallet address?)
    } catch (error) {
      console.error("error from usewalletauth", error);
    }
  };

  return { handleWalletAuth };
}
