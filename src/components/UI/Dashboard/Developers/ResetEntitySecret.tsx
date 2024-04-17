import { useState } from "react";
import { type EntitySecretAction } from "./RegisterEntitySecret";
import { z } from "zod";
import { toastError, toastSuccess, toastLoading } from "../../Toast/Toast";
import DashboardInfoBanner from "../DashboardInfoBanner";
import DashboardModalWrapper from "../DashboardModalWrapper";
import DashboardActionButton from "../DashboardActionButton";
import DashboardFileDrop from "../DashboardFileDrop";
import { InfoIcon } from "../Icons";

interface ResetEntitySecretProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  action: EntitySecretAction;
}

export default function ResetEntitySecret({
  setIsModalOpen,
  action,
}: ResetEntitySecretProps) {
  const [currEntitySecret, setCurrEntitySecret] = useState<string>("");
  const [newEntitySecret, setNewEntitySecret] = useState<string>("");
  const [recoveryFile, setRecoveryFile] = useState<File | undefined>();

  const cipherTextSchema = z.string().length(684);

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
      validateFileInput(selectedFile);
      setRecoveryFile(selectedFile);
    }
  };

  const validateFileInput = (file: File): void => {
    const looksLikeValidFile = file.name.startsWith("recovery_file");

    if (!looksLikeValidFile) {
      toastError(
        `Must be a ${process.env.NEXT_PUBLIC_PROJECT_NAME} recovery file`,
      );
      setRecoveryFile(undefined);
      return;
    }

    const fileType = file.name.split(".")[1];

    if (fileType !== "dat") {
      toastError("Recovery file must be a .dat file");
      setRecoveryFile(undefined);
      return;
    }
  };

  const onRotateClick = (): void => {
    const currSecretInput = cipherTextSchema.safeParse(currEntitySecret);
    const newSecretInput = cipherTextSchema.safeParse(newEntitySecret);

    if (!currSecretInput.success || !newSecretInput.success) {
      toastError(
        "Incorrect inputs. Ciphertexts must be 684 character base64 strings.",
      );
      return;
    }
    //TODO validation logic
    //TODO db logic to update the hash of the new entity secret
  };

  const onResetClick = (): void => {
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

    //TODO logic to validate recovery file securely
    //TODO db logic to update the hash of the new entity secret
  };

  return (
    <DashboardModalWrapper setIsModalOpen={setIsModalOpen}>
      <header className="mb-6 flex-1 py-0 pe-6 ps-6 text-xl font-semibold">
        <div className="flex items-center justify-between text-dashboard-activeTab">
          {action} your Entity Secret
        </div>
      </header>
      <div className="flex-1 py-0 pe-6 ps-6">
        <DashboardInfoBanner
          infoType="warn"
          info="Your current entity secret will be deprecated and existing requests with the current entity secret will fail after this action."
        />

        <div className="relative mt-6 w-full">
          <div className="mb-4 flex w-full">
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
          </div>
        </div>

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
          <DashboardActionButton isPrimary={false} btnText="Cancel" />
          <DashboardActionButton
            isPrimary
            btnText={action === "Rotate" ? "Rotate" : "Reset"}
            onClick={action === "Rotate" ? onRotateClick : onResetClick}
          />
        </div>
      </div>
    </DashboardModalWrapper>
  );
}
