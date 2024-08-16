import Image from "next/image";
import Link from "next/link";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { type EscrowPathProps } from "~/utils/handleServerAuth";
import DashboardTertiaryButton from "../DashboardTertiaryButton";
import { EthCircleIcon, InfoIcon, PointsIconTwo } from "../Icons";

//TODO - add user withdraw w dev controlled wallets

export default function UserWithdrawIntro({ program }: EscrowPathProps) {
  const { openConnectModal } = useConnectModal();

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
          Connect your wallet
        </h1>
        <p className="text-base font-normal leading-5 text-black opacity-65">
          to claim your {program.name} loyalty rewards
        </p>
      </div>
      <div className="flex flex-col flex-nowrap items-stretch justify-start gap-8">
        <div className="grid grid-cols-[1fr] items-stretch justify-stretch gap-2">
          <DashboardTertiaryButton
            onClick={openConnectModal as React.MouseEventHandler}
            title="Connect crypto wallet"
            icon={<EthCircleIcon size="20" />}
            withArrowIcon
          />
        </div>
        <div className="flex-norwap flex flex-row items-center justify-center">
          <div className="h-px flex-1 flex-row flex-nowrap items-stretch justify-start bg-[rgba(0,_0,_0,_0.16)]" />
          <p className="mx-4 my-0 text-[0.8125rem] font-medium leading-[1.375] text-black opacity-65">
            or
          </p>
          <div className="h-px flex-1 flex-row flex-nowrap items-stretch justify-start bg-[rgba(0,_0,_0,_0.16)]" />
        </div>
        <DashboardTertiaryButton
          onClick={() => console.log("TODO")}
          title="Claim rewards without a wallet"
          icon={<PointsIconTwo color="#5639CC" size="16" />}
          withArrowIcon
        />
      </div>

      <div className="flex flex-row items-start justify-center gap-1 text-xs text-dashboard-body">
        <span className="text-primary-1">
          <InfoIcon size={12} color="currentColor" />
        </span>
        <span className="">
          Connect your crypto wallet to view and manage rewards. If loyalty
          program is eligible, you can claim rewards without a wallet.{" "}
          <a
            className="text-primary-1 underline hover:opacity-75"
            target="_blank"
            rel="noreferrer"
            href="TODO"
          >
            Learn more.
          </a>
        </span>
      </div>
    </div>
  );
}
