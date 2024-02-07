import DashboardInfoBanner from "./DashboardInfoBanner";
import DashboardInput from "./DashboardInput";
import { InfoIcon } from "./Icons";

interface DashboardSimpleInputModalProps {
  modalTitle: string;
  modalDescription?: string;
  bannerInfo?: string;
  inputLabel: string;
  inputOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputHelpMsg: string;
  inputState: any;
  inputPlaceholder: string;
  inputInstruction?: string;
  inputDisabled: boolean;
  inputValid: boolean;
  onActionBtnClick: React.MouseEventHandler;
  btnTitle: string;
  btnDisabled: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DashboardSimpleInputModal({
  modalTitle,
  modalDescription,
  bannerInfo,
  inputLabel,
  inputOnChange,
  inputHelpMsg,
  inputState,
  inputPlaceholder,
  inputInstruction,
  inputDisabled,
  inputValid,
  onActionBtnClick,
  btnTitle,
  btnDisabled,
  setIsModalOpen,
}: DashboardSimpleInputModalProps) {
  const closeModalOnOverlayClick = (
    e: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (e.target === e.currentTarget) setIsModalOpen(false);
  };

  return (
    <>
      <div className="fixed left-0 top-0 !m-0 h-dvh w-screen bg-black/[0.32]" />
      <div
        onClick={closeModalOnOverlayClick}
        className="fixed left-0 top-0 z-[1400] flex h-dvh w-screen items-start justify-center overflow-auto overscroll-y-none"
      >
        <section className="relative z-[1400] my-16 flex w-full max-w-lg flex-col rounded-2xl bg-white py-8 outline-none [box-shadow:0_10px_15px_-3px_rgba(0,_0,_0,_0.1),0_4px_6px_-2px_rgba(0,_0,_0,_0.05)]">
          <header className="mb-6 flex-1 py-0 pe-6 ps-6 text-xl font-semibold">
            <div className="flex items-center justify-between text-dashboard-activeTab">
              {modalTitle}
            </div>
            {modalDescription && (
              <p className="mt-1 text-sm font-normal leading-5 text-dashboard-lightGray">
                {modalDescription}
              </p>
            )}
          </header>
          <div className="flex-1 py-0 pe-6 ps-6">
            {bannerInfo && (
              <DashboardInfoBanner infoType="info" info={bannerInfo} />
            )}
            <div className="relative mt-6 w-full">
              <div className="mb-4 flex w-full">
                <div className="w-full">
                  <div className="relative w-full">
                    <div className="flex justify-between">
                      <div className="relative flex">
                        <div className="flex flex-col">
                          <label className="mb-1 me-3 block text-start text-sm font-semibold text-dashboard-activeTab">
                            {inputLabel}
                          </label>
                        </div>
                      </div>
                    </div>
                    {inputInstruction && (
                      <p className="mb-2 text-[13px] font-normal leading-[1.125rem] text-dashboard-neutral">
                        {inputInstruction}
                      </p>
                    )}
                    <div className="relative isolate flex w-full">
                      <DashboardInput
                        disableCondition={inputDisabled}
                        stateVar={inputState}
                        onChange={inputOnChange}
                        placeholder={inputPlaceholder ?? `Enter ${inputLabel}`}
                        isValid={inputValid}
                        disableCorrection
                      />
                    </div>
                  </div>
                </div>
              </div>
              {inputHelpMsg && (
                <div className="mt-2 flex text-sm text-dashboard-neutral">
                  <div className="mr-1 mt-px inline-block h-[1em] w-[1em] shrink-0 text-primary-1">
                    <InfoIcon size={14} color="currentColor" />
                  </div>
                  <div className="text-[13px] text-dashboard-lightGray">
                    <p className="mb-4">{inputHelpMsg}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <footer className="mt-8 flex items-center justify-between py-0 pe-6 ps-6">
            <div className="flex w-full justify-between">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-md bg-transparent py-0 pe-3 ps-3 align-middle font-semibold leading-[1.2] text-primary-1 outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={btnDisabled}
                onClick={onActionBtnClick}
                className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 py-0 pe-3 ps-3 align-middle font-semibold leading-[1.2] text-white outline-none disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-gray-400"
              >
                {btnTitle}
              </button>
            </div>
          </footer>
        </section>
      </div>
    </>
  );
}
