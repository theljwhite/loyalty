import { useState, useRef } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { type EntitySecretAction } from "./RegisterEntitySecret";
import { z } from "zod";
import { toastError, toastSuccess } from "../../Toast/Toast";
import DashboardInfoBanner from "../DashboardInfoBanner";
import DashboardModalWrapper from "../DashboardModalWrapper";
import DashboardActionButton from "../DashboardActionButton";
import DashboardFileDrop from "../DashboardFileDrop";
import { InfoIcon } from "../Icons";

//TODO 4/18 - when db calls implemented this may also need loading state

interface ResetEntitySecretProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  action: EntitySecretAction;
}

type EntitySecretStatus = "idle" | "loading" | "success";

export default function ResetEntitySecret({
  setIsModalOpen,
  action,
}: ResetEntitySecretProps) {
  const [currEntitySecret, setCurrEntitySecret] = useState<string>(""); //refers to ciphertext
  const [newEntitySecret, setNewEntitySecret] = useState<string>(""); //refers ciphertext
  const [recoveryFile, setRecoveryFile] = useState<File | undefined>();
  const [status, setStatus] = useState<EntitySecretStatus>("idle");
  const manualDownloadRef = useRef<HTMLAnchorElement | null>(null);

  const { data: session } = useSession();
  const cipherTextSchema = z.string().length(684);
  const recoveryFileContentSchema = z.string().length(216);
  const actionSuccess = status === "success";

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length !== 1) {
      toastError("Can only select one file");
    }
    const selectedFile = files?.[0];

    if (selectedFile) {
      validateFileInput(selectedFile);
      setRecoveryFile(selectedFile);
    }
  };

  const onFileDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    const files = e.dataTransfer.files;
    if (files.length !== 1) {
      toastError("Can only select one file");
    }
    const selectedFile = files[0];

    if (selectedFile) {
      const isValidFile = validateFileInput(selectedFile);
      setRecoveryFile(isValidFile ? selectedFile : undefined);
    }
  };

  const validateFileInput = (file: File): boolean => {
    const looksLikeValidFile = file.name.startsWith("recovery_file");

    if (!looksLikeValidFile) {
      toastError(
        `Must be a ${process.env.NEXT_PUBLIC_PROJECT_NAME} recovery file`,
      );
      return false;
    }

    const fileType = file.name.split(".")[1];

    if (fileType !== "dat") {
      toastError("Recovery file must be a .dat file");
      return false;
    }
    return true;
  };

  const onRotateClick = async (): Promise<void> => {
    const currSecretInput = cipherTextSchema.safeParse(currEntitySecret);
    const newSecretInput = cipherTextSchema.safeParse(newEntitySecret);

    if (!currSecretInput.success || !newSecretInput.success) {
      toastError(
        "Incorrect inputs. Ciphertexts must be 684 character base64 strings.",
      );
      return;
    }

    setStatus("loading");

    const newFileBase64Data = await callRotateSecretGetData();

    if (newFileBase64Data) {
      const createdFile = createRecoveryFile(newFileBase64Data);

      if (createdFile) {
        toastSuccess("Success. Check downloads for your new recovery file.");
        setStatus("success");
      }
    }
  };

  const onResetClick = async (): Promise<void> => {
    if (!recoveryFile) {
      toastError("Missing recovery file. Select your recovery file.");
      return;
    }

    const newSecretInput = cipherTextSchema.safeParse(newEntitySecret);
    if (!newSecretInput.success) {
      toastError(
        "Incorrect input. Ciphertext must be a 684 character base64 string.",
      );
      return;
    }

    setStatus("loading");

    const newFileBase64Data = await parseFileCallResetSecret();

    if (newFileBase64Data) {
      const createdFile = createRecoveryFile(newFileBase64Data);

      if (createdFile) {
        toastSuccess("Success. Check downloads for your new recovery file.");
        setStatus("success");
      }
    }
  };

  const callRotateSecretGetData = async (): Promise<string | null> => {
    try {
      const route = "/api/creator/rotate-secret";
      const response = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-loyalty-creator-id": session?.user.id ?? "",
        },
        body: JSON.stringify({
          entitySecretCipherText: currEntitySecret,
          newEntitySecretCipherText: newEntitySecret,
        }),
      });

      const json = await response.json();
      if (!response.ok || "error" in json) {
        toastError(json.error);
        return null;
      }
      return json.data;
    } catch (error) {
      toastError("Failed to register entity secret. Try later.");
      return "";
    }
  };

  const parseFileCallResetSecret = async (): Promise<string | null> => {
    if (!recoveryFile) return null;

    const fileText = await recoveryFile.text();
    const base64Data = fileText.trim();

    const fileContents = recoveryFileContentSchema.safeParse(base64Data);

    if (!fileContents.success) {
      toastError("Invalid recovery file contents");
      return null;
    }

    try {
      const route = "/api/creator/reset-secret";
      const response = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-loyalty-creator-id": session?.user.id ?? "",
        },
        body: JSON.stringify({
          entitySecretCipherText: newEntitySecret,
          fileContent: base64Data,
        }),
      });

      const json = await response.json();
      if (!response.ok || "error" in json) {
        toastError(json.error);
        return null;
      }
      return json.data;
    } catch (error) {
      toastError("Failed to register entity secret. Try later.");
      return null;
    }
  };

  const createRecoveryFile = (base64Data: string): File => {
    const blob = new Blob([base64Data], { type: "text/plain" });
    const timestamp = new Date().toLocaleDateString();
    const fileName = `recovery_file_${timestamp}.dat`;

    if (manualDownloadRef.current) {
      manualDownloadRef.current.href = URL.createObjectURL(blob);
      manualDownloadRef.current.download = fileName;
      manualDownloadRef.current.click();
      //TODO - revoke object URL?
    }

    const file = new File([blob], fileName);
    return file;
  };

  return (
    <DashboardModalWrapper setIsModalOpen={setIsModalOpen}>
      <header className="mb-6 flex-1 py-0 pe-6 ps-6 text-xl font-semibold">
        <div className="flex items-center justify-between text-dashboard-activeTab">
          {actionSuccess
            ? `${action} was successful`
            : `${action} your Entity Secret`}
        </div>
      </header>
      <div className="flex-1 py-0 pe-6 ps-6">
        {actionSuccess ? (
          <DashboardInfoBanner
            infoType="warn"
            info="Make sure to download your new recovery file below, as if your entity secret is lost, you will need it to reset your secret."
          />
        ) : (
          <DashboardInfoBanner
            infoType="warn"
            info="Your current entity secret will be deprecated and existing requests with the current entity secret will fail after this action."
          />
        )}

        <div className="relative mt-6 w-full">
          <div className="mb-4 flex w-full">
            {actionSuccess ? (
              <div className="flex w-full flex-col items-center justify-center gap-6">
                <Image
                  width={100}
                  height={100}
                  src="/utilityImages/checkmarkOne.svg"
                  alt="checkmark success"
                />
              </div>
            ) : (
              <div className="flex w-full flex-col gap-4">
                {action === "Reset" ? (
                  <DashboardFileDrop
                    onFileDrop={onFileDrop}
                    onFileChange={onFileChange}
                    acceptedFiles=".dat"
                    fileState={recoveryFile}
                  />
                ) : (
                  <div className="relative w-full">
                    <div className="flex justify-between">
                      <div className="relative flex">
                        <div className="flex flex-col">
                          <label className="mb-1 me-3 block text-start text-sm font-semibold text-dashboard-activeTab">
                            Current entity secret ciphertext
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="relative isolate flex w-full">
                      <textarea
                        spellCheck="false"
                        autoComplete="off"
                        autoCorrect="false"
                        placeholder="Paste a ciphertext with your current entity secret"
                        className="h-28 w-full min-w-0 appearance-none rounded-md border border-dashboard-border1 py-2 pe-4 ps-4 align-top text-[13px] font-normal leading-[1.375] outline-none focus:border-primary-1"
                        onChange={(e) => setCurrEntitySecret(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <div className="relative w-full">
                  <div className="flex justify-between">
                    <div className="relative flex">
                      <div className="flex flex-col">
                        <label className="mb-1 me-3 block text-start text-sm font-semibold text-dashboard-activeTab">
                          New entity secret ciphertext
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="relative isolate flex w-full">
                    <textarea
                      spellCheck="false"
                      autoComplete="off"
                      autoCorrect="false"
                      placeholder="Paste a ciphertext with your new entity secret"
                      className="h-28 w-full min-w-0 appearance-none rounded-md border border-dashboard-border1 py-2 pe-4 ps-4 align-top text-[13px] font-normal leading-[1.375] outline-none focus:border-primary-1"
                      onChange={(e) => setNewEntitySecret(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <a
          target="_blank"
          ref={manualDownloadRef}
          className={`${
            actionSuccess ? "block" : "hidden"
          } cursor-pointer text-sm text-primary-1 underline hover:opacity-75`}
        >
          Recovery file didn&apos;t download? Click to download your recovery
          file.
        </a>

        <div className="mt-2 flex text-sm text-dashboard-neutral">
          <div className="mr-1 mt-px inline-block h-[1em] w-[1em] shrink-0 text-primary-1">
            <InfoIcon size={14} color="currentColor" />
          </div>
          <div className="text-[13px] text-dashboard-lightGray">
            <p className="mb-4">
              Ensure that your new entity secret is stored in a secure location.
            </p>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between">
          <DashboardActionButton
            isPrimary={false}
            btnText={actionSuccess ? "Close" : "Cancel"}
            onClick={() => setIsModalOpen(false)}
          />
          {actionSuccess ? (
            <DashboardActionButton
              isPrimary
              btnText="Continue"
              onClick={() => setIsModalOpen(false)}
            />
          ) : (
            <DashboardActionButton
              isPrimary
              btnText={action === "Rotate" ? "Rotate" : "Reset"}
              onClick={action === "Rotate" ? onRotateClick : onResetClick}
            />
          )}
        </div>
      </div>
    </DashboardModalWrapper>
  );
}
