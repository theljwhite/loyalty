import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "~/utils/api";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useTokenBalances } from "~/customHooks/useTokenBalances/useTokenBalances";
import { EvmChain } from "moralis/common-evm-utils";
import { WalletNFT } from "~/customHooks/useTokenBalances/types";
import { ROUTE_DOCS_MAIN } from "~/configs/routes";
import { copyTextToClipboard } from "~/helpers/copyTextToClipboard";
import { NUMBERS_SEPARATED_BY_COMMAS_REGEX } from "~/constants/regularExpressions";
import DashboardModalWrapper from "../../DashboardModalWrapper";
import { ClipboardOne, CoinsOne, InfoIcon } from "../../Icons";

export default function DepositERC721() {
  const [rewardsNftBalance, setRewardsNftBalance] = useState<WalletNFT[]>([]);
  const [tokenIdsToCopy, setTokenIdsToCopy] = useState<string>("");
  const [tokenIdsEntry, setTokenIdsEntry] = useState<string>("");
  const [tokenIdsEntryError, setTokenIdsEntryError] = useState<string>("");

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

  useEffect(() => {
    fetchRewardContractERC721Balance();
  }, []);

  const fetchRewardContractERC721Balance = async (): Promise<void> => {
    const rewardContractNfts = await getNFTsByContract(
      contractsDb?.escrow?.rewardAddress ?? "",
      EvmChain.MUMBAI,
    );
    if (rewardContractNfts && rewardContractNfts.length > 0) {
      setRewardsNftBalance(rewardContractNfts);

      const allTokenIdsToCopy: string = rewardContractNfts
        .map((item: WalletNFT) => Number(item.tokenId))
        .sort((a, b) => a - b)
        .join();
      setTokenIdsToCopy(allTokenIdsToCopy);
    }
  };

  const formatRewardNftsBalanceDisplay = (nfts: WalletNFT[]): JSX.Element => {
    const sortedByTokenId = nfts.sort(
      (a, b) => Number(a.tokenId) - Number(b.tokenId),
    );

    const tokens = sortedByTokenId.map((tkn, tknIndex) => (
      <span key={tkn.id} className="text-orange-400">
        {tkn.tokenId}
        {tknIndex !== nfts.length - 1 ? `,${" "}` : ""}
      </span>
    ));

    const groupsOfTenTokens = Array.from(
      { length: Math.ceil(tokens.length / 10) },
      (_, i) => tokens.slice(i * 10, (i + 1) * 10),
    );
    const tokensWithLineBreaks = groupsOfTenTokens.map((group, groupIndex) => (
      <span key={groupIndex}>
        {group}
        {groupIndex < groupsOfTenTokens.length - 1 && <br />}
      </span>
    ));

    return (
      <div className="flex max-h-[300px] w-full flex-row overflow-y-scroll text-start">
        <span className="pr-3" />
        <span className="text-md text-dashboard-codeLightBlue">
          {tokensWithLineBreaks}
        </span>
      </div>
    );
  };

  const onDepositClick = (): void => {
    validateTokenIdEntry(tokenIdsEntry);
  };

  const onTokenIdsInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    const { value } = e.target;
    setTokenIdsEntry(value);
  };

  const validateTokenIdEntry = (tokenIdsStr: string): void => {
    const tokenIdsNoSpaces = tokenIdsStr.replace(/\s/g, "");

    if (!NUMBERS_SEPARATED_BY_COMMAS_REGEX.test(tokenIdsNoSpaces)) {
      console.log("not valid");
      setTokenIdsEntryError("Invalid entry. Separate token ids by commas.");
    } else {
      console.log("valid");
      setTokenIdsEntryError("");
    }
  };

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
                <div className="mb-6 flex w-full">
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
                                  onClick={() =>
                                    copyTextToClipboard(
                                      tokenIdsToCopy,
                                      "Copied all owned token ids",
                                    )
                                  }
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
                              <section className="relative flex w-full flex-col">
                                {rewardsNftBalance.length == 0 ? (
                                  <div className="flex-rows flex w-full text-start text-white">
                                    <span className="pr-3" />
                                    <span>
                                      Could not find owned tokens for rewards
                                      contract
                                    </span>
                                  </div>
                                ) : (
                                  formatRewardNftsBalanceDisplay(
                                    rewardsNftBalance,
                                  )
                                )}
                              </section>
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
                              Enter Token Ids to Deposit
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
                            spellCheck="false"
                            autoComplete="off"
                            autoCorrect="false"
                            placeholder="ie: 0, 1, 2, 3"
                            className={`${
                              tokenIdsEntryError
                                ? "ring ring-error-1 focus:ring-primary-1"
                                : "ring-0 focus:ring-2 focus:ring-primary-1"
                            } h-40 w-full min-w-0 appearance-none rounded-md border border-dashboard-border1 py-2 pe-4 ps-4 align-top text-[13px] font-normal leading-[1.375] outline-none`}
                            onChange={(e) => onTokenIdsInputChange(e)}
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
                      Some token ids that you own may not show up above, but you
                      will still be able to deposit them.{" "}
                      <Link
                        className="text-primary-1 underline"
                        href={ROUTE_DOCS_MAIN}
                      >
                        Learn more
                      </Link>
                    </p>
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
                  onClick={onDepositClick}
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
