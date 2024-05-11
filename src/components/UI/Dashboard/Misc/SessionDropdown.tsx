import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useAccount } from "wagmi";
import { useConnectModal, useAccountModal } from "@rainbow-me/rainbowkit";
import shortenEthereumAddress from "~/helpers/shortenEthAddress";
import {
  ROUTE_DASHBOARD_CREATOR_PROFILE,
  ROUTE_DASHBOARD_MAIN,
} from "~/configs/routes";
import DashboardDropdownWrap from "../DashboardDropdownWrap";
import { ChainIcon, EditSquare, HomeIcon, SignOutSquare } from "../Icons";

interface SessionDropdownProps {
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type SessionMenuItem = {
  name: string;
  icon: JSX.Element;
  path: string;
};

export default function SessionDropdown({
  setIsDropdownOpen,
}: SessionDropdownProps) {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const connected = address && isConnected;
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();

  const menuItems: SessionMenuItem[] = [
    {
      name: "Dashboard Main",
      icon: <HomeIcon size={16} color="currentColor" />,
      path: ROUTE_DASHBOARD_MAIN,
    },
    {
      name: "Edit my profile",
      icon: <EditSquare size={16} color="currentColor" />,
      path: ROUTE_DASHBOARD_CREATOR_PROFILE,
    },
  ];

  return (
    <div className="absolute right-2 top-20 z-[1400] min-w-max">
      <DashboardDropdownWrap
        dropTitle={
          session?.user.name
            ? `Logged in as: ${session.user.name}`
            : "Logged in"
        }
        secondTitle={
          connected
            ? shortenEthereumAddress(address, 8, 8)
            : "Wallet Not Connected"
        }
        secondTitleIcon={<ChainIcon size={16} color="currentColor" />}
        secondTitleAction={connected ? openAccountModal : openConnectModal}
        additionalAction={signOut}
        actionTitle="Sign out of account"
        actionIcon={<SignOutSquare size={16} color="currentColor" />}
        setIsDropdownOpen={setIsDropdownOpen}
      >
        {menuItems.map((item, index) => {
          return (
            <div key={index}>
              <Link href={item.path}>
                <div className="focus:text-primary group flex cursor-pointer items-center gap-4 py-2 pl-4 pr-4 text-dashboardLight-secondary focus:bg-gray-50 focus:outline-none">
                  <div className="size-4 text-dashboardLight-secondary">
                    {item.icon}
                  </div>
                  <span className="flex-1 truncate text-sm">{item.name}</span>
                  <span />
                </div>
              </Link>
            </div>
          );
        })}
      </DashboardDropdownWrap>
    </div>
  );
}
