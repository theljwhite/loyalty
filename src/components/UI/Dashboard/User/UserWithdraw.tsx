import { useState, useEffect } from "react";
import Link from "next/link";
import { type EscrowPathProps } from "~/utils/handleServerAuth";
import { useRouter } from "next/router";
import { useAccountModal, useChainModal } from "@rainbow-me/rainbowkit";
import { useAccount, useNetwork } from "wagmi";
import { fetchBalance } from "wagmi/actions";
import useContractAccount from "~/customHooks/useContractAccount";
import { useContractProgression } from "~/customHooks/useContractProgression";
import { NUMBERS_OR_FLOATS_ONLY_REGEX } from "~/constants/regularExpressions";
import shortenEthereumAddress from "~/helpers/shortenEthAddress";
import { copyTextToClipboard } from "~/helpers/copyTextToClipboard";
import { ensureSameChain } from "~/utils/ensureSameChain";
import { CoinsOne, InfoIcon, EthCircleIcon, ChainIcon } from "../Icons";
import DashboardSimpleInputModal from "../DashboardSimpleInputModal";
import DashboardTertiaryButton from "../DashboardTertiaryButton";
import DashboardDataActionDisplay from "../DashboardDataActionDisplay";
import UserWithdrawIntro from "./UserWithdrawIntro";
import { toastError, toastLoading, toastSuccess } from "../../Toast/Toast";

//TODO 8-11 - fetch ERC721 and ERC1155 tkn/symbol through readContract prob
//error handle better
//fix type assertions for onClick's
//format balances better w/ always 2 decimal places

type RewardTokenDisplay = {
  name: string;
  symbol: string;
  erc20Balance?: string;
  erc721Balance?: number[];
  erc1155Balance?: { tokenId: number; amount: bigint }[];
  walletBalance?: string;
};

type WithdrawStatus = "idle" | "loading" | "success" | "error";

export default function UserWithdraw({ program }: EscrowPathProps) {
  const { rewardAddress, escrowType } = program.escrow;
  const [rewardToken, setRewardToken] = useState<RewardTokenDisplay>({
    name: "",
    symbol: "",
  });
  const [erc20WithdrawAmount, setERC20WithdrawAmount] = useState<string>("");
  const [isAmountValid, setIsAmountValid] = useState<boolean>(false);
  const [isAmountModalOpen, setIsAmountModalOpen] = useState<boolean>(false);

  const [txStatus, setTxStatus] = useState<WithdrawStatus>("idle");
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  const { isConnected, address: userAddress } = useAccount();
  const { chain } = useNetwork();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();

  const router = useRouter();
  const { escrowAddress } = router.query;

  const { userWithdrawAll, userWithdrawERC20 } = useContractAccount(
    String(escrowAddress),
    escrowType,
    program.chainId,
  );

  const { erc721Balance, erc1155Balance, getUserRewardsERC20, getUserRewards } =
    useContractProgression(
      program.address,
      program.chainId,
      String(escrowAddress),
      escrowType,
    );

  const connected = isConnected && userAddress && isClient;

  useEffect(() => {
    setIsClient(true);
    if (userAddress || txStatus === "success") {
      getTokenAndBalances();
    }
  }, [userAddress, txStatus]);

  const withdrawWithAmount = async (): Promise<void> => {
    setTxStatus("loading");
    setIsAmountModalOpen(false);
    toastLoading("Withdraw request sent to wallet", true);
    try {
      const incorrectChainMsg = await ensureSameChain(program.chainId);

      if (incorrectChainMsg) {
        toastError(incorrectChainMsg);
        return;
      }

      const txReceipt = await userWithdrawERC20(erc20WithdrawAmount);

      if (txReceipt.status === "reverted") throw new Error();

      toastSuccess(
        `Withdrawal success. Transaction hash: ${txReceipt.transactionHash}`,
      );
      setTxStatus("success");
      setERC20WithdrawAmount("");
    } catch (error) {
      toastError("Withdrawal failed. Please try again later.");
    }
  };

  const withdrawAll = async (): Promise<void> => {
    setTxStatus("loading");
    setIsAmountModalOpen(false);
    toastLoading("Withdraw request sent to wallet", true);
    try {
      const incorrectChainMsg = await ensureSameChain(program.chainId);

      if (incorrectChainMsg) {
        toastError(incorrectChainMsg);
        return;
      }

      const txReceipt = await userWithdrawAll();

      if (txReceipt.status === "reverted") throw new Error();

      toastSuccess(
        `Withdrawal success. Transaction hash: ${txReceipt.transactionHash}`,
      );
      setTxStatus("success");
    } catch (error) {
      toastError("Withdrawal failed. Please try again later.");
    }
  };

  const getTokenAndBalances = async (): Promise<void> => {
    setDataLoading(true);
    setIsAmountModalOpen(false);
    try {
      if (escrowType === "ERC20") {
        await fetchERC20TokenDetailsAndBalance();
      }
      if (escrowType === "ERC721" || escrowType === "ERC1155") {
        await getUserRewards(userAddress as string);
        //TODO
      }
      setDataLoading(false);
    } catch (error) {
      setTxStatus("idle");
    }
  };

  const fetchERC20TokenDetailsAndBalance = async (): Promise<void> => {
    const { amountToDecimals, name, symbol } = await getUserRewardsERC20(
      userAddress as string,
    );

    const rewardTokenWalletBal = await fetchBalance({
      address: userAddress as `0x${string}`,
      token: rewardAddress as `0x${string}`,
      chainId: program.chainId,
    });

    setRewardToken({
      name: name ?? "",
      symbol: symbol ?? "",
      erc20Balance: amountToDecimals,
      walletBalance: rewardTokenWalletBal.formatted,
    });
  };

  const onWithdrawAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const { value } = e.target;
    setERC20WithdrawAmount(value);

    if (!NUMBERS_OR_FLOATS_ONLY_REGEX.test(value) && value.length > 0) {
      setIsAmountValid(false);
    } else setIsAmountValid(true);
  };

  const onAmountModalClose = (): void => {
    setERC20WithdrawAmount("");
    setIsAmountModalOpen(false);
    setIsAmountValid(false);
  };

  return (
    <>
      {isAmountModalOpen && (
        <DashboardSimpleInputModal
          modalTitle="Withdraw ERC20 Amount"
          modalDescription={`Withdraw tokens that you have earned from "${program.name}" loyalty program. It will safely withdraw the tokens from the loyalty program into your crypto wallet.`}
          inputLabel="Amount"
          inputPlaceholder="eg 2 or 0.2"
          inputState={erc20WithdrawAmount}
          inputHelpMsg="You may need to top up on native tokens to cover minor gas fees when withdrawing."
          inputOnChange={onWithdrawAmountChange}
          inputDisabled={false}
          inputValid={isAmountValid}
          inputInstruction="Enter an amount of tokens to withdraw."
          btnTitle="Claim rewards"
          btnDisabled={!isAmountValid}
          onActionBtnClick={withdrawWithAmount}
          setIsModalOpen={onAmountModalClose}
        />
      )}
      <div className="z-10 flex flex-col gap-6">
        <div className="box-border w-fit">
          {connected ? (
            <div className="max-w-[calc(100vw - 5rem)] mx-7 my-0 flex w-[30rem] flex-col flex-nowrap items-stretch justify-start gap-8 rounded-2xl border-transparent bg-white px-8 pb-12 pt-[2.375rem] duration-200 [box-shadow:rgba(0,_0,_0,_0.16)_0px_24px_48px] [transition-property:background-color,_border-color,_color,_fill,_stroke,_opacity,_box-shadow,_transform]">
              <div className="space-y-4 text-primary-1">
                <CoinsOne size={20} color="currentColor" />
                <div className="space-y-1">
                  <h1 className="text-xl font-medium tracking-tight text-dashboard-activeTab">
                    Welcome, {shortenEthereumAddress(userAddress, 8, 8)}! Claim
                    your loyalty program rewards!
                  </h1>
                </div>
              </div>
              <div className="grid grid-cols-[max-content_minmax(0,1fr)] gap-y-2 text-xs">
                <DashboardDataActionDisplay
                  dataTitle="Your Wallet Balance"
                  data={`${rewardToken.walletBalance} ${rewardToken.symbol}`}
                  dataActions={[]}
                  dataLoading={dataLoading}
                />
                <DashboardDataActionDisplay
                  dataTitle="Rewards Contract Address"
                  data={rewardAddress}
                  dataActions={[
                    {
                      title: "Copy",
                      handler: () =>
                        copyTextToClipboard(
                          rewardAddress,
                          "Copied rewards contract address",
                        ),
                    },
                  ]}
                  dataLoading={dataLoading}
                />
                <DashboardDataActionDisplay
                  dataTitle="Your Rewards Balance"
                  data={
                    escrowType === "ERC20"
                      ? `${rewardToken.erc20Balance} ${rewardToken.symbol}`
                      : escrowType === "ERC721"
                        ? erc721Balance.join(",")
                        : `${erc1155Balance.length} total token Ids`
                  }
                  dataActions={[
                    {
                      title: "Withdraw",
                      handler: () => setIsAmountModalOpen(true),
                      disabled:
                        rewardToken.erc20Balance === "0.0" || dataLoading,
                    },
                    {
                      title: "Withdraw all",
                      handler: withdrawAll,
                      disabled:
                        rewardToken.erc20Balance === "0.0" || dataLoading,
                    },
                  ]}
                  dataLoading={dataLoading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <DashboardTertiaryButton
                  onClick={openAccountModal as React.MouseEventHandler}
                  title={`Connected as: ${shortenEthereumAddress(
                    userAddress,
                    8,
                    8,
                  )}`}
                  icon={<EthCircleIcon size="20" />}
                  withArrowIcon
                />
                <DashboardTertiaryButton
                  onClick={openChainModal as React.MouseEventHandler}
                  title={
                    connected && chain
                      ? `Connected on network: ${chain.name}`
                      : "Switch blockchain networks"
                  }
                  icon={<ChainIcon color="#1e3a8a" size="20" />}
                  withArrowIcon
                />
              </div>
              <div className="flex flex-row items-start justify-center gap-1 text-xs text-dashboard-body">
                <span className="text-primary-1">
                  <InfoIcon size={12} color="currentColor" />
                </span>
                <span className="">
                  You may need a small amount of native tokens to pay for minor
                  gas fees in order to withdraw.{" "}
                  <a
                    className="text-primary-1 underline hover:opacity-75"
                    target="_blank"
                    rel="noreferrer"
                    href="https://www.unicoindcx.com/educare/what-are-native-tokens"
                  >
                    Learn more.
                  </a>
                </span>
              </div>
            </div>
          ) : (
            <UserWithdrawIntro program={program} />
          )}
        </div>
        <div className="flex justify-between px-7 py-0">
          <div>
            <Link
              className="text-[12px] text-white hover:opacity-65"
              href={process.env.NEXT_PUBLIC_DOMAIN_URL as string}
            >
              © 2024 {process.env.NEXT_PUBLIC_PROJECT_NAME}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`${process.env.NEXT_PUBLIC_DOMAIN_URL}/support`}
              className="text-[12px] text-white hover:opacity-65"
            >
              Support
            </Link>
            <Link
              href={`${process.env.NEXT_PUBLIC_DOMAIN_URL}/privacy`}
              className="text-[12px] text-white hover:opacity-65"
            >
              Privacy
            </Link>
            <Link
              href={`${process.env.NEXT_PUBLIC_DOMAIN_URL}/terms`}
              className="text-[12px] text-white hover:opacity-65"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
