import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useTokenBalances } from "~/customHooks/useTokenBalances/useTokenBalances";
import { useDepositRewardsStore } from "~/customHooks/useDepositRewards/store";
import useDepositNFTRewards from "~/customHooks/useDepositRewards/useDepositNFTRewards";
import { copyTextToClipboard } from "~/helpers/copyTextToClipboard";
import { ROUTE_DOCS_MAIN } from "~/configs/routes";
import { NUMBERS_SEPARATED_BY_COMMAS_REGEX } from "~/constants/regularExpressions";
import DashboardModalWrapper from "../../DashboardModalWrapper";
import DashboardInput from "../../DashboardInput";
import DashboardModalStatus from "../../DashboardModalStatus";
import DashboardSummaryTable from "../../DashboardSummaryTable";
import { CoinsOne, ClipboardOne, InfoIcon } from "../../Icons";
import { type WalletNFT } from "~/customHooks/useTokenBalances/types";
import { findIfMoralisEvmChain } from "~/configs/moralis";
import { toastError } from "~/components/UI/Toast/Toast";
import { MAX_DIFF_TOKEN_IDS_ERC1155 } from "~/constants/loyaltyConstants";

//TODO - may need better input handling and handling of amounts for possible massive numbers lol's

export default function DepositERC1155() {
  const [rewardsNftBalance, setRewardsNftBalance] = useState<WalletNFT[]>([]);
  const [tokenIdsEntry, setTokenIdsEntry] = useState<string>("");
  const [tokenAmountsEntry, setTokenAmountsEntry] = useState<string>("");
  const [tokensToCopy, setTokensToCopy] = useState<string>("");
  const [entryError, setEntryError] = useState<{
    id: boolean;
    amount: boolean;
  }>({ id: false, amount: false });
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);

  const router = useRouter();
  const { address: loyaltyAddress } = router.query;
  const { isConnected, address: userConnectedAddress } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { getNFTsByContract } = useTokenBalances();
  const {
    erc1155IdsDeposit,
    depositReceipt,
    isDepositReceiptOpen,
    isSuccess,
    setIsDepositReceiptOpen,
    setERC1155IdsDeposit,
    setTxListError,
  } = useDepositRewardsStore((state) => state);

  const { data: contractsDb } = api.escrow.getDepositRelatedData.useQuery(
    {
      loyaltyAddress: String(loyaltyAddress),
    },
    { refetchOnWindowFocus: false },
  );
  const rewardsAddress = contractsDb?.escrow?.rewardAddress ?? "";
  const escrowAddress = contractsDb?.escrow?.address ?? "";
  const deployedChainId = contractsDb?.loyaltyProgram?.chainId ?? 0;
  const depositKey = contractsDb?.escrow?.depositKey ?? "";

  const { depositERC1155 } = useDepositNFTRewards(
    rewardsAddress,
    escrowAddress,
    deployedChainId,
  );

  useEffect(() => {
    if (isConnected && userConnectedAddress) {
      fetchUserRewardContractERC1155Bal();
    }
  }, [isConnected, userConnectedAddress, isSuccess]);

  const fetchUserRewardContractERC1155Bal = async (): Promise<void> => {
    try {
      const evmChain = findIfMoralisEvmChain(
        contractsDb?.loyaltyProgram?.chainId ?? 0,
      );
      if (evmChain) {
        const rewardContractNfts = await getNFTsByContract(
          contractsDb?.escrow?.rewardAddress ?? "",
          evmChain,
        );
        if (rewardContractNfts && rewardContractNfts.length > 0) {
          setRewardsNftBalance(rewardContractNfts);

          const allTokenIdsToCopy: string = rewardContractNfts
            .map((nft) => Number(nft.tokenId))
            .sort((a, b) => a - b)
            .join();
          setTokensToCopy(allTokenIdsToCopy);
        }
      }
    } catch (error) {
      setTxListError(
        "Could not fetch balance at this time for your deployed chain",
      );
    }
  };

  const onDepositClick = (): void => {
    const tokenIdsEntryArr = tokenIdsEntry.split(",");
    const tokenAmountsEntryArr = tokenAmountsEntry.split(",");

    const isValid = validateIdsAndAmounts(
      tokenIdsEntryArr,
      tokenAmountsEntryArr,
    );
    setERC1155IdsDeposit(tokenIdsEntryArr);
    if (isValid) {
      depositERC1155(tokenIdsEntryArr, tokenAmountsEntryArr, depositKey);
      setIsDepositModalOpen(false);
    }
  };

  const validateIdsAndAmounts = (ids: string[], amounts: string[]): boolean => {
    if (ids.length > MAX_DIFF_TOKEN_IDS_ERC1155) {
      toastError("You can only deposit 5 or less different token ids");
      setEntryError({ id: true, amount: true });
      return false;
    }

    if (ids.length !== amounts.length) {
      toastError(
        "Token ids and amounts must be the same length, separated by commas",
      );
      setEntryError({ id: true, amount: true });
      return false;
    }
    const areAmountsValid = amounts.every(
      (amount) => !isNaN(Number(amount.trim())),
    );

    if (!areAmountsValid) {
      toastError("Amounts must be numbers");
      setEntryError({ id: false, amount: true });
      return false;
    }

    const allTokenIdsExistInBal = ids.every((tokenId) =>
      rewardsNftBalance.some((nft) => nft.tokenId === tokenId),
    );

    if (!allTokenIdsExistInBal) {
      toastError("You entered a token id that you do not own in your wallet");
      setEntryError({ id: true, amount: false });
      return false;
    }
    const amountsAreSufficient = ids.every((tokenId, index) => {
      const correspondingToken = rewardsNftBalance.find(
        (nft) => nft.tokenId === tokenId,
      );
      return (
        correspondingToken &&
        correspondingToken.amount &&
        Number(amounts[index]) <= correspondingToken.amount
      );
    });

    if (!amountsAreSufficient) {
      toastError("Insufficient amount for an entered token id");
      setEntryError({ id: true, amount: true });
      return false;
    }

    return true;
  };

  const validateTokenInputs = (entryStr: string, inputId: string): void => {
    const noSpaces = entryStr.replace(/\s/g, "");
    if (!NUMBERS_SEPARATED_BY_COMMAS_REGEX.test(noSpaces)) {
      setEntryError({ id: true, amount: true });
    } else {
      setEntryError({ id: false, amount: false });
    }
  };

  const onTokenIdEntryChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setTokenIdsEntry(e.target.value);
    validateTokenInputs(e.target.value, e.target.id);
  };

  const onTokenAmountEntryChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setTokenAmountsEntry(e.target.value);
    validateTokenInputs(e.target.value, e.target.id);
  };

  return (
    <>
      {isDepositReceiptOpen && (
        <DashboardModalStatus
          title="Deposit successful"
          description="Your ERC721 deposit into escrow contract was successful."
          status="success"
          setIsModalOpen={setIsDepositReceiptOpen}
          additionalStyling={
            <DashboardSummaryTable
              title="Transaction details"
              dataObj={{
                hash: depositReceipt.hash,
                gasCost: depositReceipt.gasPrice.toString(),
                gasUsed: depositReceipt.gasUsed.toString(),
                depositedAmount: `${erc1155IdsDeposit.length} tokens`,
              }}
            />
          }
        />
      )}

      <button
        type="button"
        onClick={
          isConnected && userConnectedAddress
            ? () => setIsDepositModalOpen(true)
            : openConnectModal
        }
        className="relative inline-flex h-8 min-w-10 appearance-none items-center justify-center whitespace-nowrap rounded-md bg-primary-1 pe-3 ps-3 align-middle text-sm font-semibold leading-[1.2] text-white outline-none"
      >
        <span className="me-2 inline-flex shrink-0 self-center">
          <CoinsOne size={16} color="currentColor" />
        </span>
        Deposit ERC1155
      </button>

      {isDepositModalOpen && (
        <DashboardModalWrapper setIsModalOpen={setIsDepositModalOpen}>
          <>
            <header className="mb-6 flex-1 py-0 pe-6 ps-6 text-xl font-semibold">
              <div className="flex items-center justify-between text-dashboard-activeTab">
                Deposit ERC1155 Tokens
              </div>

              <p className="mt-1 text-sm font-normal leading-5 text-dashboard-lightGray">
                Deposit ERC1155 tokens into your escrow contract to be used for
                rewards.
              </p>
            </header>
            <div className="flex-1 py-0 pe-6 ps-6">
              <div className="relative mt-6 w-full">
                <div className="mb-6 flex w-full">
                  <div className="w-full">
                    <div className="relative w-full">
                      <div className="flex justify-between">
                        <div className="relative flex">
                          <div className="flex flex-col">
                            <label className="mb-1 me-3 block text-start text-sm font-semibold text-dashboard-activeTab">
                              Your Rewards Contract ERC1155 Token Balance
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
                                  Owned Token Ids and Amounts
                                </p>
                              </div>
                              <div className="ml-auto flex gap-1">
                                <button
                                  onClick={() =>
                                    copyTextToClipboard(
                                      tokensToCopy,
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
                                  <div className="flex max-h-[300px] w-full flex-row overflow-y-scroll text-start">
                                    <span className="pr-3" />
                                    <span className="text-md text-dashboard-codeLightBlue">
                                      {rewardsNftBalance.map((nft) => {
                                        return (
                                          <span key={nft.id}>
                                            Token Id {nft.tokenId}:{" "}
                                            <span className="text-orange-400">
                                              {nft.amount?.toLocaleString()}
                                            </span>
                                            <br />
                                          </span>
                                        );
                                      })}
                                    </span>
                                  </div>
                                )}
                              </section>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-6 flex w-full">
                  <div className="w-full">
                    <div className="relative w-full">
                      <div className="flex justify-between">
                        <div className="relative flex">
                          <div className="flex flex-col">
                            <label className="mb-1 me-3 block text-start text-sm font-semibold text-dashboard-activeTab">
                              Token Ids
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
                          <DashboardInput
                            id="tokenIdsEntry"
                            stateVar={tokenIdsEntry}
                            placeholder="ie 1,2,3,4"
                            isValid={!entryError.id}
                            disableCondition={false}
                            onChange={onTokenIdEntryChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-6 flex w-full">
                  <div className="w-full">
                    <div className="relative w-full">
                      <div className="flex justify-between">
                        <div className="relative flex">
                          <div className="flex flex-col">
                            <label className="mb-1 me-3 block text-start text-sm font-semibold text-dashboard-activeTab">
                              Amounts of Token Ids
                            </label>
                          </div>
                        </div>
                      </div>

                      <p className="mb-2 text-[13px] font-normal leading-[1.125rem] text-dashboard-neutral">
                        The amounts should correspond to the token ids entered
                        above, separated by commas.
                      </p>

                      <div className="relative isolate flex w-full">
                        <div className="flex w-full flex-row items-center">
                          <DashboardInput
                            id="tokenAmountsEntry"
                            stateVar={tokenAmountsEntry}
                            placeholder="ie 100, 200, 300, 1000"
                            isValid={!entryError.amount}
                            disableCondition={false}
                            onChange={onTokenAmountEntryChange}
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
