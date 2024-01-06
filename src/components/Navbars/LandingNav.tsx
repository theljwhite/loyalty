import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ConnectWalletButton } from "../UI/ConnectWalletButton";

export default function LandingNav() {
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
          <div className="flex items-center gap-4">
            <div className="inline-flex h-8 leading-none">
              <div>
                <button className="font-lunch p-0 pr-3 text-base tracking-normal">
                  {/* TODO - create org button? */}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center">
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
