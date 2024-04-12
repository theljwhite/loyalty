import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toastError, toastSuccess } from "../../Toast/Toast";
import { api } from "~/utils/api";
import { ClipboardOne, EyeTransform } from "../Icons";
import { copyTextToClipboard } from "~/helpers/copyTextToClipboard";
import { relayChains } from "~/configs/openzeppelin";
import { DashboardLoadingSpinner } from "../../Misc/Spinners";
import DashboardInfoBanner from "../DashboardInfoBanner";
import DashboardActionButton from "../DashboardActionButton";
import DashboardSimpleInputModal from "../DashboardSimpleInputModal";

//TODO - this component needs cleaned up in general, lol.
//needs better UI.
//will refactor this.
//TODO - for now, make keys scrollable when visible without setting max-w to 600?

type ApiKeyStatus = "idle" | "loading" | "error" | "success";

export default function CreatorApiKeys() {
  const [newApiKey, setNewApiKey] = useState<string>("");
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>("idle");
  const [isKeyVisible, setIsKeyVisible] = useState<boolean>(false);
  const [isEnvVisible, setIsEnvVisible] = useState<boolean>(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [confirmInput, setConfirmInput] = useState<string>("");
  const [confirmValid, setConfirmValid] = useState<boolean>(false);

  const { data: session } = useSession();
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;

  const { data: program } =
    api.loyaltyPrograms.getDeploymentInfoByAddress.useQuery(
      {
        loyaltyAddress: String(loyaltyAddress),
      },
      { refetchOnWindowFocus: false },
    );
  const { data: apiCreateDate, isLoading: apiDateLoading } =
    api.users.getApiKeyCreationDate.useQuery(
      {
        creatorId: session?.user.id ?? "",
      },
      { refetchOnWindowFocus: false },
    );
  const [relayChain] = relayChains.filter(
    (chain) => chain.id === program?.chainId,
  );
  const isTestnetApikey = relayChain?.isTestChain;
  const requestHeaders = {
    "Content-Type": "application/json",
    "x-loyalty-creator-id": session?.user.id ?? "",
    "x-loyalty-address": String(loyaltyAddress),
    "x-loyalty-chain": String(relayChain?.id ?? ""),
  };

  const handleGenerateApiKey = async (): Promise<void> => {
    setApiKeyStatus("loading");
    const route = "/api/creator/gen-api-key";
    try {
      const response = await fetch(route, {
        method: "POST",
        headers: requestHeaders,
      });
      if (response.ok) {
        const data = await response.json();
        const apiKey = data.apiKey;

        const didPublicKeyGenerate = await handleGeneratePublicKey();

        if (!didPublicKeyGenerate) {
          toastError("Error generating keys. Try again in a moment.");
          setApiKeyStatus("error");
        }

        if (didPublicKeyGenerate) {
          setApiKeyStatus("success");
          setNewApiKey(apiKey);
          toastSuccess("Created new API key.");
        }
      }
    } catch (error) {
      toastError("Error generating api key. Try again in a moment.");
      setApiKeyStatus("error");
    }
  };

  const handleGeneratePublicKey = async (): Promise<boolean> => {
    const route = "/api/creator/gen-public-key";
    const response = await fetch(route, {
      method: "POST",
      headers: requestHeaders,
    });
    if (response.ok) return true;
    return false;
  };

  const onConfirmCreateKey = async (): Promise<void> => {
    setIsConfirmOpen(false);
    await handleGenerateApiKey();
  };

  const onCreateKeyClick = async (): Promise<void> => {
    if (apiCreateDate) {
      setIsConfirmOpen(true);
    } else {
      await handleGenerateApiKey();
    }
  };

  const onConfirmChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setConfirmInput(e.target.value);
    validateConfirm(e.target.value);
  };

  const validateConfirm = (input: string): void => {
    const confirmRegex = /^confirm$/i;
    if (confirmRegex.test(input)) setConfirmValid(true);
    else setConfirmValid(false);
  };

  return (
    <>
      {isConfirmOpen && (
        <DashboardSimpleInputModal
          modalTitle="Confirm API Key Creation"
          modalDescription="Please type Confirm below to verify your changes"
          bannerInfo="Your existing API Key will be made invalid and a new API key will be created."
          inputLabel="Confirm New API Key"
          inputHelpMsg={`Existing key will be made invalid. Visit docs and learn more about your API key before proceeding`}
          inputState={confirmInput}
          inputInstruction="Please type 'Confirm' in order to create a new API key and replace your existing one"
          inputOnChange={onConfirmChange}
          inputPlaceholder="Please type: Confirm"
          inputValid={confirmValid}
          inputDisabled={false}
          btnTitle="Create New Key"
          btnDisabled={!confirmValid}
          onActionBtnClick={onConfirmCreateKey}
          setIsModalOpen={setIsConfirmOpen}
        />
      )}
      <div className="mt-8 flex flex-1 flex-row items-start rounded-2xl border border-dashboard-border1 bg-white py-8 pe-6 ps-6">
        <div className="min-w-0 flex-1">
          <div className="block flex-1">
            <div className="mb-1 flex items-center justify-start">
              <p className="text-md font-semibold leading-6 text-dashboard-body">
                API Key
              </p>
            </div>
            <span className="mt-2 text-[13px] font-normal leading-[1.125] text-black opacity-65">
              Your API key which is required to interact with{" "}
              {process.env.NEXT_PUBLIC_PROJECT_NAME} API routes and SDK.
            </span>
          </div>
          <div className="mt-3">
            <DashboardInfoBanner
              infoType="warn"
              info="Creating a new API key will block your existing API key (if you have one) and generate a new one. Once generated, the full key will be shown to you below one time and will afterwards be irretrievable. We recommend reading about your key and best security practices."
            />
          </div>
          <div className="mt-3 flex w-full flex-row justify-between">
            <DashboardActionButton
              btnType="button"
              isPrimary={false}
              btnText="View Usage Logs"
            />
            <DashboardActionButton
              btnType="button"
              onClick={onCreateKeyClick}
              isPrimary
              btnText="Create New Key"
            />
          </div>
          {apiKeyStatus === "loading" || apiDateLoading ? (
            <div className="mt-6 flex items-center justify-center">
              <div className="flex">
                <div className="flex w-full justify-center">
                  <span className="text-center text-xs font-normal leading-[1.125rem] text-black opacity-65">
                    <DashboardLoadingSpinner size={40} />
                  </span>
                </div>
              </div>
            </div>
          ) : apiCreateDate && !newApiKey ? (
            <div className="mt-8">
              <hr className="m-0 border-dashboard-border1" />
              <div className="block overflow-x-auto">
                <table className="table w-full border-collapse">
                  <thead className="table-header-group align-middle">
                    <tr className="table-row overflow-hidden">
                      <th className="table-cell border-b border-l border-dashboard-border1 py-3 pe-6 ps-6 text-start text-xs capitalize leading-4">
                        Existing Key
                      </th>
                      <th className="table-cell border-b border-dashboard-border1 py-3 pe-6 ps-6 text-start text-xs capitalize leading-4">
                        Type
                      </th>
                      <th className="table-cell border-b border-r border-dashboard-border1 py-3 pe-6 ps-6 text-start text-xs capitalize leading-4">
                        Created On
                      </th>
                    </tr>
                  </thead>

                  {!newApiKey && !apiCreateDate ? (
                    <tbody className="table-row-group align-middle">
                      <tr className="table-row">
                        <td
                          colSpan={5}
                          className="table-cell border-b border-dashboard-border1 py-4 pe-6 ps-6 text-start leading-5 text-dashboard-lightGray"
                        >
                          <div className="flex">
                            <div className="flex w-full justify-center">
                              <span className="text-center text-xs font-normal leading-[1.125rem] text-black opacity-65">
                                You do not have an API key yet.
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody className="table-row-group align-middle">
                      <tr className="table-row">
                        <td className="rounded-y-md whitespace-nowrap border-l border-dashboard-border1 py-4 pe-6 ps-6 text-start text-[13px] font-normal leading-5">
                          <div className="flex">
                            <div className="flex items-center">
                              <div className="shadow-gray-900/8 relative isolate inline-flex h-6 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-b from-white px-3 text-xs tracking-tight text-green-600 shadow-sm ring-1 ring-dashboard-border1 [--badge-indicator-color:theme(colors.green.500)] [text-shadow:0px_1px_0px_theme(colors.white)]">
                                <div className="aspect-square w-1 rounded-full bg-[--badge-indicator-color]"></div>
                                <span>Active</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap py-4 pe-6 ps-6 text-start text-[13px] font-normal leading-5">
                          <div className="flex">
                            <div className="flex items-center">
                              <p className="line-clamp-1 overflow-hidden text-ellipsis text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
                                {isTestnetApikey ? "TESTNET" : "MAINNET"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="rounded-y-md whitespace-nowrap border-r border-dashboard-border1 py-4 pe-6 ps-6 text-start text-[13px] font-normal leading-5">
                          <div className="flex">
                            <div className="flex items-center">
                              <p className="line-clamp-1 overflow-hidden text-ellipsis text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
                                {apiCreateDate.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  )}
                </table>
              </div>
              <hr className="m-0 border-dashboard-border1" />
            </div>
          ) : (
            newApiKey && (
              <div>
                <div className="mt-3 block break-words">
                  <div className="ms-1 flex flex-1 flex-col overflow-hidden">
                    <div className="flex w-full flex-col gap-2 overflow-hidden rounded-md bg-dashboard-codeBox p-4">
                      <div className="flex w-full justify-between">
                        <div className="flex">
                          <p className="overflow-hidden truncate text-sm font-semibold leading-5 text-white">
                            Your New API Key (created just now)
                          </p>
                        </div>
                        <div className="ml-auto flex gap-1">
                          <button
                            onClick={() => setIsKeyVisible(!isKeyVisible)}
                            className="relative inline-flex h-auto appearance-none items-center justify-center truncate bg-transparent p-0  align-middle leading-[1.2] text-white outline-none"
                          >
                            <span className="inline-block h-5 w-5 shrink-0 leading-[1em]">
                              <EyeTransform
                                size={20}
                                color="currentColor"
                                line={isKeyVisible}
                              />
                            </span>
                          </button>

                          <button
                            disabled={!newApiKey}
                            onClick={() =>
                              copyTextToClipboard(newApiKey, "Copied API key")
                            }
                            className="relative inline-flex h-auto appearance-none items-center justify-center truncate bg-transparent p-0 align-middle leading-[1.2] text-white outline-none"
                          >
                            <span className="inline-block h-5 w-5 shrink-0 leading-[1em]">
                              <ClipboardOne size={20} color="currentColor" />
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="relative flex max-w-[600px] overflow-x-auto">
                        <span className="text-md text-white">
                          {isKeyVisible
                            ? newApiKey
                            : Array(100).fill("").join("•") +
                              newApiKey.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 block break-words">
                  <div className="ms-1 flex flex-1 flex-col overflow-hidden">
                    <div className="flex w-full flex-col gap-2 overflow-hidden rounded-md bg-dashboard-codeBox p-4">
                      <div className="flex w-full justify-between">
                        <div className="flex">
                          <p className="overflow-hidden truncate text-sm font-semibold leading-5 text-white">
                            .env
                          </p>
                        </div>
                        <div className="ml-auto flex gap-1">
                          <button
                            onClick={() => setIsEnvVisible(!isEnvVisible)}
                            className="relative inline-flex h-auto appearance-none items-center justify-center truncate bg-transparent p-0  align-middle leading-[1.2] text-white outline-none"
                          >
                            <span className="inline-block h-5 w-5 shrink-0 leading-[1em]">
                              <EyeTransform
                                size={20}
                                color="currentColor"
                                line={isEnvVisible}
                              />
                            </span>
                          </button>

                          <button
                            disabled={!newApiKey}
                            onClick={() =>
                              copyTextToClipboard(
                                `${process.env.NEXT_PUBLIC_PROJECT_NAME}_API_KEY=` +
                                  newApiKey,
                                "Copied API Key environment variable",
                              )
                            }
                            className="relative inline-flex h-auto appearance-none items-center justify-center truncate bg-transparent p-0 align-middle leading-[1.2] text-white outline-none"
                          >
                            <span className="inline-block h-5 w-5 shrink-0 leading-[1em]">
                              <ClipboardOne size={20} color="currentColor" />
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="relative flex">
                        <div className="overflow-x-auto whitespace-nowrap leading-[1.8]">
                          <div className="max-w-[600px] overflow-x-auto">
                            <span className="select-none pr-3 text-white opacity-50">
                              1
                            </span>
                            <span className="uppercase text-dashboard-codeLightBlue">
                              {process.env.NEXT_PUBLIC_PROJECT_NAME}_API_KEY
                            </span>
                            <span className="text-white">=</span>

                            <span className="text-md text-white">
                              {isEnvVisible ? newApiKey : Array(80).fill("•")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
