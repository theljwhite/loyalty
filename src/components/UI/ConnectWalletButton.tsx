import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

interface ConnectWalletBtnProps {
  displayOptions?: ConnectDisplayOptions;
}
interface ConnectDisplayOptions {
  showChainName?: boolean;
  showOnlyChainSwitcher?: boolean;
}

export const ConnectWalletButton: React.FC<ConnectWalletBtnProps> = ({
  displayOptions = {},
}) => {
  const { showChainName = true, showOnlyChainSwitcher = false } =
    displayOptions;

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const isConnected = chain && account && mounted;

        return (
          <div
            className="font-lunch"
            {...(!mounted && {
              "aria-hidden": true,
              style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
            })}
          >
            {!isConnected ? (
              <button
                type="button"
                className="bg-neutral-2 flex items-center gap-1 rounded-xl px-3 py-2 text-[18px] font-bold"
                onClick={openConnectModal}
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={openChainModal}
                  className="bg-neutral-2 flex items-center gap-1 rounded-xl px-3 py-2 text-[18px] font-bold"
                >
                  {chain.hasIcon && (
                    <div
                      className="mr-1 h-6 w-6 overflow-hidden"
                      style={{
                        borderRadius: 999,
                        background: chain.iconBackground,
                      }}
                    >
                      {chain.iconUrl && (
                        <Image
                          src={chain.iconUrl}
                          // src="utilityImages/connectedWhite.svg"
                          width={24}
                          height={24}
                          alt={chain.name ?? "Chain icon"}
                        />
                      )}
                    </div>
                  )}
                  {showChainName && <p>{chain.name}</p>}

                  <Image
                    width={24}
                    height={24}
                    src="/utilityImages/downChevron.svg"
                    alt="arrow down"
                    className="w-6"
                  />
                </button>
                {!showOnlyChainSwitcher && (
                  <button
                    className="bg-neutral-2 flex items-center rounded-xl px-3 py-2 text-[18px] font-bold"
                    onClick={openAccountModal}
                    type="button"
                  >
                    {account.displayName}
                    <Image
                      width={24}
                      height={24}
                      src="/utilityImages/downChevron.svg"
                      alt="arrow down"
                      className="ml-1 w-6"
                    />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
