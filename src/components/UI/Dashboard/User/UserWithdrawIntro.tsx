import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useConnectModal, useChainModal } from "@rainbow-me/rainbowkit";
import { type EscrowPathProps } from "~/utils/handleServerAuth";
import shortenEthereumAddress from "~/helpers/shortenEthAddress";
import { MovingArrow } from "../Icons";

export default function UserWithdrawIntro({
  program,
  connected,
}: EscrowPathProps & { connected: boolean }) {
  const { address: userAddress } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();

  return (
    <div className="max-w-[calc(100vw - 5rem)] mx-7 my-0 flex w-[25rem] flex-col flex-nowrap items-stretch justify-start gap-8 rounded-2xl border-transparent bg-white px-8 pb-12 pt-[2.375rem] duration-200 [box-shadow:rgba(0,_0,_0,_0.16)_0px_24px_48px] [transition-property:background-color,_border-color,_color,_fill,_stroke,_opacity,_box-shadow,_transform]">
      <div className="flex h-6 flex-row flex-nowrap items-stretch justify-start object-cover">
        <Link href={process.env.NEXT_PUBLIC_DOMAIN_URL as string}>
          <Image
            width={24}
            height={24}
            alt="project logo"
            src="/tempProjectLogo.svg"
          />
        </Link>
      </div>
      <div className="flex flex-col flex-nowrap items-stretch justify-start gap-1">
        <h1 className="m-0 text-lg font-bold leading-6 text-black">
          {connected ? "Connecting your wallet..." : "Connect your wallet"}
        </h1>
        <p className="text-base font-normal leading-5 text-black opacity-65">
          to claim your {program.name} loyalty rewards
        </p>
      </div>
      <div className="flex flex-col flex-nowrap items-stretch justify-start gap-8">
        <div className="grid grid-cols-[1fr] items-stretch justify-stretch gap-2 "></div>
        <div className="flex-norwap flex flex-row items-center justify-center">
          <div className="h-px flex-1 flex-row flex-nowrap items-stretch justify-start bg-[rgba(0,_0,_0,_0.16)]" />

          <div className="h-px flex-1 flex-row flex-nowrap items-stretch justify-start bg-[rgba(0,_0,_0,_0.16)]" />
        </div>

        <button
          type="button"
          onClick={connected ? openChainModal : openConnectModal}
          className="group relative m-0 inline-flex min-h-[2.25rem] w-full cursor-pointer items-center justify-start gap-4 truncate rounded-md border border-solid border-[rgba(0,0,0,0.08)] bg-[unset] px-5 py-2.5 text-sm font-normal leading-none tracking-[0.5px] text-black outline-none duration-100 [transition-property:background-color,_border-color,_color,_fill,_stroke,_opacity,_box-shadow,_transform] hover:bg-neutral-2"
        >
          <span className=" flex flex-[0_0_1.25rem] flex-row flex-nowrap items-center justify-center">
            <Image
              src="/providerImages/ethLogo.svg"
              alt="wallet icon"
              className="h-auto w-4 max-w-full"
              width={20}
              height={20}
            />
          </span>
          <div className="flex w-full w-full flex-row flex-nowrap items-center justify-center gap-2 overflow-hidden">
            <span className="truncate text-sm font-normal leading-5 text-black">
              {connected ? "Switch networks" : "Connect crypto wallet"}
            </span>
          </div>
          <MovingArrow size="20" />
        </button>
      </div>
      <div className="flex flex-row flex-nowrap items-center justify-between">
        <span className="m-0 text-[0.8125rem] leading-tight text-black opacity-65">
          {connected
            ? `Connected as ${shortenEthereumAddress(
                userAddress as string,
                8,
                8,
              )}`
            : "Connect your crypto wallet to withdraw rewards."}
        </span>
      </div>
    </div>
  );
}
