import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ClipboardOne, CoinsOne, EyeTransform, InfoIcon } from "../../Icons";
import DashboardModalWrapper from "../../DashboardModalWrapper";
import { useTokenBalances } from "~/customHooks/useTokenBalances/useTokenBalances";
import { EvmChain } from "moralis/common-evm-utils";
import DashboardCopyDataBox from "../../DashboardCopyDataBox";

export default function DepositERC721() {
  const router = useRouter();
  const { address: loyaltyAddress } = router.query;
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const { isConnected, address: userConnectedAddress } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { getNFTsByContract } = useTokenBalances();

  const { data: contractsDb } = api.escrow.getDepositRelatedData.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress),
    },
    { refetchOnWindowFocus: false },
  );

  const fetchRewardContractERC721Balance = async (): Promise<void> => {
    const nfts = await getNFTsByContract(
      contractsDb?.escrow?.rewardAddress ?? "",
      EvmChain.MUMBAI,
    );
    console.log("nfts -->", nfts);
  };

  useEffect(() => {
    fetchRewardContractERC721Balance();
  }, []);

  return (
    <>
      {isConnected && userConnectedAddress ? (
        <button
          type="button"
          onClick={() => setIsDepositModalOpen(true)}
          className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-3 ps-3 align-middle text-sm font-semibold leading-[1.2] text-white outline-none"
        >
          <span className="me-2 inline-flex shrink-0 self-center">
            <CoinsOne size={16} color="currentColor" />
          </span>
          Deposit ERC721
        </button>
      ) : (
        <button
          type="button"
          onClick={openConnectModal}
          className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-3 ps-3 align-middle text-sm font-semibold leading-[1.2] text-white outline-none"
        >
          Connect Wallet
        </button>
      )}
      {isDepositModalOpen && (
        <DashboardModalWrapper setIsModalOpen={setIsDepositModalOpen}>
          <>
            <header className="mb-6 flex-1 py-0 pe-6 ps-6 text-xl font-semibold">
              <div className="flex items-center justify-between text-dashboard-activeTab">
                Deposit ERC721 Tokens
              </div>

              <p className="mt-1 text-sm font-normal leading-5 text-dashboard-lightGray">
                Deposit ERC721 tokens into your escrow contract to be used for
                rewards.
              </p>
            </header>
            <div className="flex-1 py-0 pe-6 ps-6">
              {/* {bannerInfo && (
              <DashboardInfoBanner infoType="info" info={bannerInfo} />
            )} */}
              <div className="relative mt-6 w-full">
                <div className="mb-4 flex w-full">
                  <div className="w-full">
                    <div className="relative w-full">
                      <div className="flex justify-between">
                        <div className="relative flex">
                          <div className="flex flex-col">
                            <label className="mb-1 me-3 block text-start text-sm font-semibold text-dashboard-activeTab">
                              Your Rewards Contract ERC721 Token Balance
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="relative isolate flex w-full">
                        <div className="flex w-full flex-row items-center">
                          <div className="flex w-full flex-col gap-2 overflow-hidden rounded-md bg-dashboard-codeBox p-4">
                            <div className="flex w-full justify-between">
                              <div className="flex">
                                <p className="overflow-hidden truncate text-sm font-semibold capitalize leading-5 text-white">
                                  Owned Token Ids
                                </p>
                              </div>
                              <div className="ml-auto flex gap-1">
                                <button
                                  // onClick={() =>
                                  //   copyTextToClipboard(String(dataToCopy), copySuccessMessage)
                                  // }
                                  className="relative inline-flex h-auto appearance-none items-center justify-center truncate bg-transparent p-0 align-middle leading-[1.2] text-white outline-none"
                                >
                                  <span className="inline-block h-5 w-5 shrink-0 leading-[1em]">
                                    <ClipboardOne
                                      size={20}
                                      color="currentColor"
                                    />
                                  </span>
                                </button>
                              </div>
                            </div>
                            <div className="relative flex">
                              <pre className="whitespace-prewrap m-0 p-0 text-sm font-normal leading-5 text-white">
                                Lorem ipsum dolor sit amet consectetur
                                adipisicing elit. Esse, repudiandae.
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-4 flex w-full">
                  <div className="w-full">
                    <div className="relative w-full">
                      <div className="flex justify-between">
                        <div className="relative flex">
                          <div className="flex flex-col">
                            <label className="mb-1 me-3 block text-start text-sm font-semibold text-dashboard-activeTab">
                              Enter Token Ids
                            </label>
                          </div>
                        </div>
                      </div>

                      <p className="mb-2 text-[13px] font-normal leading-[1.125rem] text-dashboard-neutral">
                        Enter the token ids that you wish to deposit, separated
                        by commas.
                      </p>

                      <div className="relative isolate flex w-full">
                        <div className="flex w-full flex-row items-center">
                          <textarea
                            placeholder="ie: 0, 1, 2, 3"
                            className={`ring-none h-40 w-full min-w-0 appearance-none rounded-md border border-dashboard-border1 py-2 pe-4 ps-4 align-top text-[13px] font-normal leading-[1.375]`}
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
                    <p className="mb-4">TODO help message here</p>
                  </div>
                </div>
              </div>
            </div>
            <footer className="mt-8 flex items-center justify-between py-0 pe-6 ps-6">
              <div className="flex w-full justify-between">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-md bg-transparent py-0 pe-3 ps-3 align-middle font-semibold leading-[1.2] text-primary-1 outline-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  // disabled={btnDisabled}
                  // onClick={onActionBtnClick}
                  className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 py-0 pe-3 ps-3 align-middle font-semibold leading-[1.2] text-white outline-none disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-gray-400"
                >
                  Deposit tokens
                </button>
              </div>
            </footer>
          </>
        </DashboardModalWrapper>
      )}
    </>
  );
}
