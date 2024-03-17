import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { toastError } from "../../Toast/Toast";
import DashboardCopyDataBox from "../DashboardCopyDataBox";

//TODO - this may be deleted

type ApiKeyStatus = "idle" | "loading" | "error" | "success";

export default function CreatorApiKeys() {
  const [apiKey, setApiKey] = useState<string>(
    "Your api key will be shown here",
  );
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>("idle");

  const { data: session } = useSession();
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const handleGenerateApiKey = async (): Promise<void> => {
    setApiKeyStatus("loading");
    try {
      const response = await fetch(
        `${process.env.BASE_INTERNAL_API_URL}/creator/api-key`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creatorId: session?.user?.id ?? "",
            creatorAddress: address,
            loyaltyAddress,
          }),
        },
      );
      if (response.ok) {
        const apiKey = await response.json();
        setApiKeyStatus("success");
        setApiKey(apiKey);
      }
    } catch (error) {
      console.error("error from gen -->", error);
      toastError("Error generating api key. Try again in a moment.");
      setApiKeyStatus("error");
    }
  };

  return (
    <>
      <DashboardCopyDataBox
        title="API Key"
        description={`Your api key which will be required to interact with ${process.env.NEXT_PUBLIC_PROJECT_NAME} api routes. It will be required to execute objective completions within your own app or website when using our package. The key is specific to the loyalty program that you are interacting with now.`}
        copySuccessMessage="Copied API key"
        copyBoxLabel="Your API Key"
        containerBg="bg-neutral-2"
        dataToCopy={apiKey}
        dataLoading={apiKeyStatus === "loading"}
        actionTitle={
          isConnected && address
            ? "Generate API Key"
            : "Connect wallet to generate API key"
        }
        additionalAction={
          isConnected && address ? handleGenerateApiKey : openConnectModal
        }
        isSecret
        outlinkTitle="This API key will only be visible once, so please store it in a secure location such as in a .env file"
        outlink="TODO"
      />
    </>
  );
}
