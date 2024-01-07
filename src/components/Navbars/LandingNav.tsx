import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { ConnectWalletButton } from "../UI/ConnectWalletButton";

export default function LandingNav() {
  const { data: session } = useSession();
  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/60 backdrop-blur-lg">
      <div className="mx-auto flex w-[94vw] max-w-screen-xl items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <Link href={process.env.NEXT_PUBLIC_DOMAIN_URL as string}>
            <Image
              width="28"
              height="28"
              src="tempProjectLogo.svg"
              alt="project logo"
            />
          </Link>
          {/* <span className="font-lunch text-3xl font-medium text-gray-200">
            /
          </span> */}
          <div className="flex items-center gap-4">
            <span className="border-top h-6 w-6 border-neutral-2"></span>
            <button
              type="button"
              className="group flex w-full items-center justify-between font-lunch focus:outline-none"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="block aspect-square w-10 shrink-0 overflow-hidden rounded-full border border-neutral-1">
                  <Image
                    width={40}
                    height={40}
                    alt="user avatar"
                    src="utilityImages/blankAvatar.svg"
                  />
                </span>
                <div>
                  <Link href="/programs">
                    <span className="truncate font-lunch text-lg font-medium hover:text-primary-1">
                      Engage{" "}
                    </span>
                  </Link>
                  <span className="font-lunch text-lg font-medium">/</span>
                  <Link href="/dashboard">
                    <span className="truncate font-lunch text-lg font-medium hover:text-primary-1">
                      {" "}
                      Create
                    </span>
                  </Link>
                </div>
              </span>
              <span className="pl-4 opacity-60 transition-opacity group-hover:opacity-100">
                <svg
                  className="size-4 overflow-visible stroke-[1.25]"
                  fill="none"
                  height="20"
                  viewBox="0 0 20 20"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.1029 7.30379C15.3208 7.5974 15.2966 8.01406 15.0303 8.28033C14.7374 8.57322 14.2626 8.57322 13.9697 8.28033L10 4.31066L6.03033 8.28033L5.94621 8.35295C5.6526 8.5708 5.23594 8.5466 4.96967 8.28033C4.67678 7.98744 4.67678 7.51256 4.96967 7.21967L9.46967 2.71967L9.55379 2.64705C9.8474 2.4292 10.2641 2.4534 10.5303 2.71967L15.0303 7.21967L15.1029 7.30379ZM4.89705 12.6962C4.6792 12.4026 4.7034 11.9859 4.96967 11.7197C5.26256 11.4268 5.73744 11.4268 6.03033 11.7197L10 15.6893L13.9697 11.7197L14.0538 11.6471C14.3474 11.4292 14.7641 11.4534 15.0303 11.7197C15.3232 12.0126 15.3232 12.4874 15.0303 12.7803L10.5303 17.2803L10.4462 17.3529C10.1526 17.5708 9.73594 17.5466 9.46967 17.2803L4.96967 12.7803L4.89705 12.6962Z"
                    fill="#212121"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
        <div className="flex flex-row items-center">
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
