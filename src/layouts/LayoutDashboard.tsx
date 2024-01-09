import React, { useState, useEffect } from "react";
import { getLayout } from "./Base";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useAccount, useNetwork } from "wagmi";
import shortenEthereumAddress from "~/helpers/shortenEthAddress";
import {
  useAccountModal,
  useChainModal,
  useConnectModal,
} from "@rainbow-me/rainbowkit";
import {
  ROUTE_DASHBOARD_HOME,
  ROUTE_DASHBORD_ANALYTICS,
  ROUTE_DASHBOARD_BALANCES,
  ROUTE_DASHBOARD_OVERVIEW,
  ROUTE_DASHBOARD_OBJECTIVES,
  ROUTE_DASHBOARD_TIERS,
  ROUTE_DASHBOARD_ESCROW_OVERVIEW,
  ROUTE_DASHBOARD_ESCROW_SETTINGS,
  ROUTE_DASHBOARD_USER_COMPLETION,
  ROUTE_DASHBOARD_USER_POINTS,
  ROUTE_DASHBOARD_USER_REWARDS,
  ROUTE_DASHBOARD_API_KEY,
  ROUTE_DASHBOARD_DOMAINS,
} from "~/configs/routes";
import {
  HomeIcon,
  WalletIcon,
  ChainIcon,
  AnalyticsIconOne,
  EyeballIcon,
  ObjectivesIconOne,
  TiersIconOne,
  ChecklistIcon,
  PointsIcon,
  ShieldIconOne,
  SettingsOne,
  CoinsOne,
  KeyIcon,
  DomainIcon,
  UpDownChevron,
} from "~/components/UI/Dashboard/Icons/index";

interface LayoutDashboardSidebarProps {
  children: React.ReactNode;
}

interface NavLinkProps {
  link: NavLink;
  pathname: string;
}

type NavLink = {
  id: number;
  label: string;
  href: string;
  icon: JSX.Element;
};

const NavLink: React.FC<NavLinkProps> = ({ link, pathname }): JSX.Element => {
  const activeTabClass =
    "text-dashboard-primary flex items-center justify-between rounded-md bg-dashboard-activeTab px-3 py-2 shadow-[inset_0_1px_0_theme(colors.white/4%),inset_0_0_0_1px_theme(colors.white/2%),0_0_0_1px_theme(colors.black/20%),0_2px_2px_-1px_theme(colors.black/20%),0_4px_4px_-2px_theme(colors.black/20%)]";
  const inactiveTabClass =
    "flex items-center justify-between rounded-md px-3 py-2 text-dashboard-secondary hover:bg-dashboard-body hover:text-dashboard-primary";

  return (
    <div key={link.id}>
      <Link
        href={link.href}
        className="mt-[calc(0.125rem * calc(1))] mb-[calc(0.125rem)] block"
      >
        <button className="relative w-full">
          <span
            className={
              link.href === pathname ? activeTabClass : inactiveTabClass
            }
          >
            <span className="flex items-center justify-between gap-3">
              {link.icon}
              <span className="flex items-center gap-2 text-base text-sm font-medium ">
                {link.label}
              </span>
            </span>
          </span>
        </button>
      </Link>
    </div>
  );
};

const LayoutDashboard = (props: LayoutDashboardSidebarProps) => {
  const { children } = props;
  const { data: session } = useSession();
  const { pathname } = useRouter();
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  const { openAccountModal } = useAccountModal();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const [isClient, setIsClient] = useState<boolean>();

  const connected = isConnected && address && isClient;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navLinks: NavLink[] = [
    {
      id: 0,
      label: "Home",
      href: ROUTE_DASHBOARD_HOME,
      icon: <HomeIcon size={16} color="currentColor" />,
    },
    {
      id: 1,
      label: "Balances",
      href: ROUTE_DASHBOARD_BALANCES,
      icon: <WalletIcon size={16} color="currentColor" />,
    },
    {
      id: 2,
      label: "Analytics",
      href: ROUTE_DASHBORD_ANALYTICS,
      icon: <AnalyticsIconOne size={16} color="currentColor" />,
    },
    {
      id: 3,
      label: "Overview",
      href: ROUTE_DASHBOARD_OVERVIEW,
      icon: <EyeballIcon size={16} color="currentColor" />,
    },
    {
      id: 4,
      label: "Objectives",
      href: ROUTE_DASHBOARD_OBJECTIVES,
      icon: <ObjectivesIconOne size={16} color="currentColor" />,
    },
    {
      id: 5,
      label: "Tiers",
      href: ROUTE_DASHBOARD_TIERS,
      icon: <TiersIconOne size={16} color="currentColor" />,
    },
    {
      id: 6,
      label: "Escrow Overview",
      href: ROUTE_DASHBOARD_ESCROW_OVERVIEW,
      icon: <ShieldIconOne size={16} color="currentColor" />,
    },
    {
      id: 7,
      label: "Escrow Settings",
      href: ROUTE_DASHBOARD_ESCROW_SETTINGS,
      icon: <SettingsOne size={16} color="currentColor" />,
    },
    {
      id: 8,
      label: "User Objectives",
      href: ROUTE_DASHBOARD_USER_COMPLETION,
      icon: <ChecklistIcon size={16} color="currentColor" />,
    },
    {
      id: 9,
      label: "User Points",
      href: ROUTE_DASHBOARD_USER_POINTS,
      icon: <PointsIcon size={16} color="currentColor" />,
    },
    {
      id: 10,
      label: "User Rewards",
      href: ROUTE_DASHBOARD_USER_REWARDS,
      icon: <CoinsOne size={16} color="currentColor" />,
    },
    {
      id: 11,
      label: "API Keys",
      href: ROUTE_DASHBOARD_API_KEY,
      icon: <KeyIcon size={16} color="currentColor" />,
    },
    {
      id: 12,
      label: "Domains",
      href: ROUTE_DASHBOARD_DOMAINS,
      icon: <DomainIcon size={16} color="currentColor" />,
    },
  ];

  return (
    <>
      <div className="relative m-0 min-h-full bg-dashboard-body2 font-lunch text-base antialiased">
        <div className="flex h-[100dvh]">
          <aside className="before:z-2 relative isolate flex h-full w-[17.5rem] shrink-0 flex-col text-dashboard-primary before:pointer-events-none before:absolute before:inset-x-0 before:bottom-0 before:h-[6.25rem] before:bg-gradient-to-t before:from-gray-900/90">
            <div className="relative border-b border-gray-900 px-4 pb-6 pt-5 shadow-[0_1px_0] shadow-gray-800">
              <button
                type="button"
                className="group flex w-full items-center justify-between focus:outline-none"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="block aspect-square w-10 shrink-0 overflow-hidden rounded-full">
                    <Image
                      width={40}
                      height={40}
                      alt="user avatar"
                      src={
                        session?.user.image ?? "utilityImages/blankAvatar.svg"
                      }
                    />
                  </span>
                  <div>
                    <span className="truncate font-lunch text-lg font-medium">
                      Dashboard
                    </span>
                  </div>
                </span>
                <span className="text-neutral-2 opacity-60 transition-opacity group-hover:opacity-100">
                  <UpDownChevron size={16} color="currentColor" />
                </span>
              </button>
              <div className="mt-5 space-y-px">
                <button
                  onClick={connected ? openAccountModal : openConnectModal}
                  type="button"
                  className="group flex w-full items-center justify-between text-sm focus:outline-none"
                >
                  <span className="flex items-center gap-3 px-3 py-1.5 text-dashboard-secondary">
                    <span className="relative">
                      <WalletIcon size={16} color="currentColor" />
                      <span
                        className={`${
                          connected ? "bg-success-1" : "bg-orange-400"
                        } absolute -top-px size-2.5 rounded-full border-2 border-gray-900 shadow-[inset_0_0.5px_0_theme(colors.white/10%),inset_0_0_0_0.5px_theme(colors.white/10%)]`}
                      />
                    </span>
                    <span className="truncate text-sm">
                      {connected
                        ? `${shortenEthereumAddress(address as string, 8, 8)}`
                        : "Connect wallet"}
                    </span>
                  </span>
                  <span></span>
                </button>
                <button
                  onClick={connected ? openChainModal : openConnectModal}
                  type="button"
                  className="group flex w-full items-center justify-between text-sm focus:outline-none"
                >
                  <span className="flex items-center gap-3 px-3 py-1.5 text-dashboard-secondary">
                    <ChainIcon size={16} color="currentColor" />
                    <span className="text-sm">
                      {connected && chain ? chain.name : "Switch chains"}
                    </span>
                  </span>
                  <span></span>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <nav className="space-y-8 py-5">
                <div className="space-y-xs isolate px-4">
                  {navLinks.slice(0, 3).map((link) => {
                    return (
                      <NavLink key={link.id} link={link} pathname={pathname} />
                    );
                  })}
                </div>
                <div className="space-y-2 px-3">
                  <span className="pl-3 text-xs font-medium text-gray-400">
                    Loyalty Program
                  </span>
                  <div className="space-y-xs">
                    {navLinks.slice(3, 8).map((link) => {
                      return (
                        <NavLink
                          key={link.id}
                          link={link}
                          pathname={pathname}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2 px-3">
                  <span className="pl-3 text-xs font-medium text-gray-400">
                    Program Users
                  </span>
                  <div className="space-y-xs">
                    {navLinks.slice(8, 11).map((link) => {
                      return (
                        <NavLink
                          key={link.id}
                          link={link}
                          pathname={pathname}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2 px-3">
                  <span className="pl-3 text-xs font-medium text-gray-400">
                    Developers
                  </span>
                  <div className="space-y-xs">
                    {navLinks.slice(11, 13).map((link) => {
                      return (
                        <NavLink
                          key={link.id}
                          link={link}
                          pathname={pathname}
                        />
                      );
                    })}
                  </div>
                </div>
              </nav>
            </div>
          </aside>
          <main className="relative isolate h-[calc(100%-0.5rem)] flex-1 self-end rounded-tl-2xl bg-white shadow-[0_0_0_1px,-2px_0_2px_-1px,-4px_0_4px_-2px] shadow-black/60">
            <div className="mx-auto h-full min-w-[42rem] max-w-6xl overflow-y-auto rounded-[inherit] p-10 pb-20 font-lunch">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export const getDashboardLayout = (page: ReactNode) => {
  return getLayout(<LayoutDashboard>{page}</LayoutDashboard>);
};
