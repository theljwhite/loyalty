import { useState, useRef } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "~/utils/api";
import { z } from "zod";
import { ROUTE_DASHBOARD_API_KEY, ROUTE_DOCS_SDK_MAIN } from "~/configs/routes";
import { toastError, toastSuccess } from "../../Toast/Toast";
import DashboardActionButton from "../DashboardActionButton";
import ResetEntitySecret from "./ResetEntitySecret";
import DashboardPageLoading from "../DashboardPageLoading";
import { DashboardLoadingSpinner } from "../../Misc/Spinners";

export type EntitySecretAction = "Rotate" | "Reset";
type RegisterSecretStatus = "idle" | "loading" | "success";

export default function RegisterEntitySecret() {
  const [cipherTextEntry, setCipherTextEntry] = useState<string>("");
  const [isResetSecretOpen, setIsResetSecretOpen] = useState<boolean>(false);
  const [secretAction, setSecretAction] =
    useState<EntitySecretAction>("Rotate");
  const [registerStatus, setRegisterStatus] =
    useState<RegisterSecretStatus>("idle");
  const manualDownloadRef = useRef<HTMLAnchorElement | null>(null);

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;
  const { data: session } = useSession();
  const cipherTextSchema = z.string().length(684);

  const { data: entitySecretUpdatedAt, isLoading: entitySecretLoading } =
    api.users.getEntitySecretUpdatedDate.useQuery(
      {
        creatorId: session?.user.id ?? "",
      },
      { refetchOnWindowFocus: false },
    );

  const registerEntitySecret = async (): Promise<void> => {
    setRegisterStatus("loading");

    const isEntryValid = validateCipherTextEntry();
    if (!isEntryValid) {
      toastError(
        "Invalid cipher text. Should be a base64 encoded string of 684 characters.",
      );
      setRegisterStatus("idle");
      return;
    }

    const base64data = await callRegisterAndGenRecoveryFile();
    if (!base64data) {
      toastError("Failed to register entity secret. Try later");
      setRegisterStatus("idle");
      return;
    }

    const blob = new Blob([base64data], { type: "text/plain" });
    const timestamp = new Date().toLocaleDateString();

    if (manualDownloadRef.current) {
      manualDownloadRef.current.href = URL.createObjectURL(blob);
      manualDownloadRef.current.download = `recovery_file_${timestamp}.dat`;
      manualDownloadRef.current.click();
    }

    toastSuccess("Success. Check downloads for your recovery file.");
    setRegisterStatus("success");
  };

  const callRegisterAndGenRecoveryFile = async (): Promise<string> => {
    try {
      const route = "/api/creator/register-secret";
      const response = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-loyalty-creator-id": session?.user.id ?? "",
        },
        body: JSON.stringify({
          entitySecretCipherText: cipherTextEntry,
        }),
      });

      if (!response.ok) return "";

      const base64Data = await response.json();
      return base64Data.data;
    } catch (error) {
      return "";
    }
  };

  const validateCipherTextEntry = (): boolean => {
    const input = cipherTextSchema.safeParse(cipherTextEntry);
    if (!input.success) return false;
    return true;
  };

  const openResetModal = (action: EntitySecretAction): void => {
    setSecretAction(action);
    setIsResetSecretOpen(true);
  };

  if (entitySecretLoading) return <DashboardPageLoading />;

  return (
    <>
      {isResetSecretOpen && (
        <ResetEntitySecret
          setIsModalOpen={setIsResetSecretOpen}
          action={secretAction}
        />
      )}
      <div className="relative flex flex-1 flex-col rounded-2xl border border-dashboard-border1 py-8 pe-6 ps-6">
        <div className="flex-start flex flex-row">
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-md font-semibold capitalize leading-6">
                {entitySecretUpdatedAt
                  ? "Entity Secret Configurator"
                  : "Register Entity Secret"}
                {!entitySecretUpdatedAt && (
                  <code className="ml-1 inline-flex items-center gap-1 whitespace-nowrap bg-dashboard-badge py-0.5 pe-1.5 ps-1.5 align-middle text-xs font-normal leading-[1.4] text-dashboard-required">
                    Required for SDK
                  </code>
                )}
              </p>
            </div>
            <p className="mb-6 text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
              Entity Secret is a 32 byte key used to enhance security when
              making critical API/SDK requests. If you need to generate one, you
              can do so from{" "}
              <Link
                className="text-primary-1 underline"
                href={ROUTE_DASHBOARD_API_KEY(String(loyaltyAddress))}
              >
                API Keys.
              </Link>
            </p>
            {entitySecretUpdatedAt && (
              <p className="mb-6 text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
                If you still need to download the recovery file that is used in
                the case of an entity secret loss, you can do so by rotating
                your entity secret.
              </p>
            )}

            {!entitySecretUpdatedAt && (
              <div>
                <p className="mb-6 text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
                  If you already have one, encrypt the entity secret using your
                  public key.{" "}
                  <Link
                    href={ROUTE_DOCS_SDK_MAIN}
                    className="text-primary-1 underline"
                  >
                    Learn more
                  </Link>{" "}
                  about encrypting entity secret to make a ciphertext. After
                  your entity secret is registered, you will be provided a
                  recovery file in the case of a loss.
                </p>
              </div>
            )}
            {entitySecretUpdatedAt ? (
              <div className="border-box">
                <div className="mt-8">
                  <hr className="m-0 border-dashboard-border1" />
                  <div className="block overflow-x-auto">
                    <table className="table w-full border-collapse">
                      <thead className="table-header-group align-middle">
                        <tr className="table-row overflow-hidden">
                          <th className="table-cell border-b border-l border-dashboard-border1 py-3 pe-6 ps-6 text-start text-xs capitalize leading-4">
                            Entity Secret
                          </th>
                          <th className="table-cell border-b border-dashboard-border1 py-3 pe-6 ps-6 text-start text-xs capitalize leading-4">
                            Registered On
                          </th>
                          <th className="table-cell border-b border-r border-dashboard-border1 py-3 pe-6 ps-6 text-start text-xs capitalize leading-4">
                            Last Updated
                          </th>
                        </tr>
                      </thead>

                      <tbody className="table-row-group align-middle">
                        <tr className="table-row">
                          <td className="rounded-y-md whitespace-nowrap border-l border-dashboard-border1 py-4 pe-6 ps-6 text-start text-[13px] font-normal leading-5">
                            <div className="flex">
                              <div className="flex items-center">
                                <div className="shadow-gray-900/8 relative isolate inline-flex h-6 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-b from-white px-3 text-xs tracking-tight text-green-600 shadow-sm ring-1 ring-dashboard-border1 [--badge-indicator-color:theme(colors.green.500)] [text-shadow:0px_1px_0px_theme(colors.white)]">
                                  <div className="aspect-square w-1 rounded-full bg-[--badge-indicator-color]"></div>
                                  <span>Registered</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap py-4 pe-6 ps-6 text-start text-[13px] font-normal leading-5">
                            <div className="flex">
                              <div className="flex items-center">
                                <p className="line-clamp-1 overflow-hidden text-ellipsis text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
                                  {entitySecretUpdatedAt.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="rounded-y-md whitespace-nowrap border-r border-dashboard-border1 py-4 pe-6 ps-6 text-start text-[13px] font-normal leading-5">
                            <div className="flex">
                              <div className="flex items-center">
                                <p className="line-clamp-1 overflow-hidden text-ellipsis text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
                                  {entitySecretUpdatedAt.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <hr className="m-0 border-dashboard-border1" />
                  <div className="mt-6 flex w-full flex-row items-center justify-between">
                    <DashboardActionButton
                      isPrimary={false}
                      btnText="Reset Entity Secret"
                      btnType="button"
                      onClick={() => openResetModal("Reset")}
                    />
                    <DashboardActionButton
                      isPrimary
                      btnText="Rotate Entity Secret"
                      btnType="button"
                      onClick={() => openResetModal("Rotate")}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-box">
                <p className="text-[13px] font-semibold leading-5 text-dashboard-body">
                  Paste your encrypted Entity Secret Ciphertext here
                </p>
                <div className="break-words">
                  <div className="mt-2">
                    <div className="mt-2 flex">
                      <div className="relative w-full">
                        <div className="relative isolate flex w-full">
                          <textarea
                            spellCheck="false"
                            autoComplete="off"
                            autoCorrect="false"
                            placeholder="Paste ciphertext here. It should be a 684 character base64 string."
                            className="h-40 w-full min-w-0 appearance-none rounded-md border border-dashboard-border1 py-2 pe-4 ps-4 align-top text-[13px] font-normal leading-[1.375] outline-none focus:border-primary-1"
                            value={cipherTextEntry}
                            onChange={(e) => setCipherTextEntry(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="my-6 text-[13px] font-normal leading-[1.125] text-dashboard-lightGray">
                    We do not store your Entity Secret. Because of this, it is
                    your responsibility to maintain its security. You must
                    register your entity secret ciphertext here before using API
                    or SDK. Afterwards, for subsequent requests, the SDK will
                    handle generating a cipher text internally.
                  </p>
                  <div className="mt-6 flex w-full flex-row items-center justify-between">
                    <DashboardActionButton
                      isPrimary={false}
                      btnText="Clear Entry"
                      btnType="button"
                      onClick={() => setCipherTextEntry("")}
                    />
                    {registerStatus === "success" && (
                      <DashboardActionButton
                        isPrimary
                        btnText="Download Recovery File"
                        btnType="button"
                        onClick={() => manualDownloadRef.current?.click()}
                      />
                    )}
                    <a
                      className="hidden"
                      target="_blank"
                      ref={manualDownloadRef}
                    >
                      Download Recovery File
                    </a>

                    {registerStatus === "loading" ? (
                      <div className="mr-12">
                        <DashboardLoadingSpinner size={30} />
                      </div>
                    ) : (
                      <DashboardActionButton
                        isPrimary
                        btnText="Register Entity Secret"
                        btnType="button"
                        onClick={registerEntitySecret}
                        disableCondition={registerStatus === "success"}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
