import Image from "next/image";
import Link from "next/link";
import { ModalSpinner } from "../Misc/Spinners";
import { InfoIcon } from "./Icons";

type DashboardModalStatus = "loading" | "success" | "error";

interface DashboardModalStatusProps {
  title: string;
  description?: string;
  helpMsg?: string;
  helpLink?: string;
  status: DashboardModalStatus;
  additionalStyling?: JSX.Element;
  setIsModalOpen: (isModalOpen: boolean) => void;
  onContinueClick?: () => any;
}

export default function DashboardModalStatus({
  title,
  description,
  helpMsg,
  helpLink,
  status,
  additionalStyling,
  setIsModalOpen,
  onContinueClick,
}: DashboardModalStatusProps) {
  const closeModalOnOverlayClick = (
    e: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (
      e.target === e.currentTarget &&
      (status === "success" || status === "error")
    ) {
      setIsModalOpen(false);
    }
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="fixed left-0 top-0 !m-0 h-dvh w-screen bg-black/[0.32]" />
      <div
        onClick={(e) => closeModalOnOverlayClick(e)}
        className="fixed left-0 top-0 z-[1400] flex h-dvh w-screen items-start justify-center overflow-auto overscroll-y-none"
      >
        <section className="relative z-[1400] my-16 flex w-full max-w-lg flex-col rounded-2xl bg-white py-8 outline-none [box-shadow:0_10px_15px_-3px_rgba(0,_0,_0,_0.1),0_4px_6px_-2px_rgba(0,_0,_0,_0.05)]">
          <header className="mb-6 flex-1 py-0 pe-6 ps-6 text-xl font-semibold">
            <div className="flex items-center justify-between text-dashboard-activeTab">
              {title}
            </div>

            {description && (
              <p className="mt-1 text-sm font-normal leading-5 text-dashboard-lightGray">
                {description}
              </p>
            )}
          </header>

          <div className="relative mt-6 w-full">
            <div className="mb-4 flex w-full">
              <div className="w-full">
                <div className="relative w-full">
                  <div className="flex items-center justify-center">
                    <div className="relative flex">
                      <div className="flex flex-col items-center justify-center">
                        {status === "loading" ? (
                          <ModalSpinner size={40} />
                        ) : status === "error" ? (
                          <div>
                            <Image
                              src="/utilityImages/errorOne.svg"
                              width={60}
                              height={60}
                              alt="checkmark success"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2 pe-6 ps-6">
                            {additionalStyling && additionalStyling}
                            <Image
                              src="/utilityImages/checkmarkOne.svg"
                              width={50}
                              height={50}
                              alt="checkmark success"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {helpMsg && (
            <footer className="mt-8 flex items-center justify-between py-0 pe-6 ps-6">
              <div className="mt-2 flex text-sm text-dashboard-neutral">
                <div className="mr-1 mt-px inline-block h-[1em] w-[1em] shrink-0 text-primary-1">
                  <InfoIcon size={14} color="currentColor" />
                </div>

                <div className="text-[13px] text-dashboard-lightGray">
                  <p className="mb-4">
                    {helpMsg}{" "}
                    {helpLink && (
                      <Link
                        className="text-primary-1 underline"
                        href={helpLink}
                      >
                        Learn more in docs.
                      </Link>
                    )}
                  </p>
                </div>
              </div>
            </footer>
          )}
          {(status === "success" || status === "error") && (
            <footer className="mt-8 flex items-center justify-between py-0 pe-6 ps-6">
              <div className="flex w-full justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-md bg-transparent py-0 pe-3 ps-3 align-middle font-semibold leading-[1.2] text-primary-1 outline-none"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={onContinueClick ?? closeModal}
                  className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 py-0 pe-3 ps-3 align-middle font-semibold leading-[1.2] text-white outline-none disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-gray-400"
                >
                  Continue
                </button>
              </div>
            </footer>
          )}
        </section>
      </div>
    </>
  );
}
