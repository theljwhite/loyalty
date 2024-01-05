import React, { useState, useEffect } from "react";
import { useConnectModal, useAccountModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useAccount } from "wagmi";
import ConnectWalletButton from "../UI/ConnectWalletButton";

type DesktopMenuItems = {
  id: number;
  title: string;
  href: string;
  icon: string;
};

export default function LandingNav() {
  const { isConnected, address } = useAccount();
  const [isOnClient, setIsOnClient] = useState<boolean>(false);
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();

  useEffect(() => {
    setIsOnClient(true);
  }, []);

  const desktopMenuItems: DesktopMenuItems[] = [
    {
      id: 0,
      title: "Dashboard",
      href: "/creator/dashboard",
      icon: "",
    },
    { id: 1, title: "Profile", href: "/creator/profile", icon: "" },
    { id: 2, title: "Sign in", href: "", icon: "" },
  ];

  return (
    <nav className="absolute top-0 z-30 mb-4 mt-6 flex w-full flex-wrap items-center justify-between px-4 py-2 shadow-none lg:flex-nowrap lg:justify-start">
      <div className="flex-wrap-inherit mx-auto my-auto flex w-full items-center justify-between px-5 py-0 py-6">
        <Link
          className="ml-4 mr-4 whitespace-nowrap py-2 text-sm font-bold text-white lg:ml-0"
          href={process.env.NEXT_PUBLIC_DOMAIN_URL as string}
        >
          {process.env.NEXT_PUBLIC_PROJECT_NAME}
        </Link>
        {/* MOBILE BURGER BUTTON*/}
        <div className="ease-soft-in-out ml-2 flex cursor-pointer rounded-lg border border-solid border-transparent bg-transparent px-3 py-1 text-lg leading-none shadow-none transition-all lg:hidden">
          <span className="mt-2 inline-block h-6 w-6 bg-none bg-cover bg-center bg-no-repeat align-middle">
            <span className="rounded-xs duration-350 relative mx-auto my-0 block h-[1px] w-[1.375rem] bg-white transition-all"></span>
            <span className="rounded-xs duration-350 relative mx-auto my-0 mt-2 block h-[1px] w-[1.375rem] bg-white transition-all"></span>
            <span className="rounded-xs duration-350 relative mx-auto my-0 mt-2 block h-[1px] w-[1.375rem] bg-white transition-all"></span>
          </span>
        </div>
        {/* END MOBILE BURDER BUTTON */}

        <div className="ease-soft duration-350 lg-max:bg-white hidden flex-grow basis-full items-center rounded-xl transition-all lg:flex lg:basis-auto">
          <ul className="mx-auto mb-0 flex list-none flex-col pl-0 lg:flex-row xl:ml-auto">
            {desktopMenuItems.map((item) => {
              return (
                <li key={item.id}>
                  <Link
                    className="duration-250 lg-max:text-slate-700 ease-soft-in-out lg-max:opacity-0 mr-2 flex items-center px-4 py-2 text-sm font-normal text-white transition-all lg:px-2 lg:hover:text-white/75"
                    href={item.href}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
          <ul className="mb-0 hidden list-none pl-0 lg:block lg:flex-row">
            <li>
              {address && isOnClient ? (
                <button className="leading-pro hover:scale-102 hover:shadow-soft-xs ease-soft-in tracking-tight-soft shadow-soft-md lg-max:opacity-0 mb-0 mr-1 inline-block cursor-pointer rounded-3xl border-0  bg-white px-8 py-2 text-center align-middle text-xs font-bold text-slate-800 transition-all active:opacity-85">
                  Connected: {address}
                </button>
              ) : (
                <ConnectWalletButton />
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
