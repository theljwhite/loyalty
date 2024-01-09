import Link from "next/link";
import Image from "next/image";
import React from "react";
import { signIn } from "next-auth/react";
import { useWalletAuth } from "~/customHooks/useWalletAuth/useWalletAuth";

type SignInOption = {
  id: number;
  provider: string;
  logo: string;
};

export default function SignIn() {
  const { handleWalletAuth } = useWalletAuth();

  const signInOptions: SignInOption[] = [
    { id: 0, provider: "discord", logo: "providerImages/discordBlue.svg" },
    { id: 1, provider: "google", logo: "providerImages/google.svg" },
  ];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center pb-4 pt-10 font-lunch md:pb-0 md:pt-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(238.39deg,#9F39CC 1.59%,#8542d8 22.32%,#5639CC 65.8%,#3966CC 102.16%)",
        }}
      ></div>
      <div className="z-10 flex flex-col gap-6">
        <div className="box-border w-fit">
          <div className="max-w-[calc(100vw - 5rem)] mx-7 my-0 flex w-[25rem] flex-col flex-nowrap items-stretch justify-start gap-8 rounded-2xl border-transparent bg-white px-8 pb-12 pt-[2.375rem] duration-200 [box-shadow:rgba(0,_0,_0,_0.16)_0px_24px_48px] [transition-property:background-color,_border-color,_color,_fill,_stroke,_opacity,_box-shadow,_transform]">
            <div className="flex h-6 flex-row flex-nowrap items-stretch justify-start object-cover">
              <Link href={process.env.NEXT_PUBLIC_DOMAIN_URL as string}>
                <Image
                  width={24}
                  height={24}
                  alt="project logo"
                  src={"tempProjectLogo.svg"}
                />
              </Link>
            </div>
            <div className="flex flex-col flex-nowrap items-stretch justify-start gap-1">
              <h1 className="m-0 text-lg font-bold leading-6 text-black">
                Sign in
              </h1>
              <p className="text-base font-normal leading-5 text-black opacity-65">
                to continue to {process.env.NEXT_PUBLIC_PROJECT_NAME}
              </p>
            </div>
            <div className="flex flex-col flex-nowrap items-stretch justify-start gap-8">
              <div className="grid grid-cols-[1fr] items-stretch justify-stretch gap-2 ">
                {signInOptions.map((option) => {
                  return (
                    <button
                      onClick={() =>
                        signIn(option.provider, {
                          redirect: true,
                          callbackUrl: "/",
                        })
                      }
                      type="button"
                      key={option.id}
                      className="group relative m-0 inline-flex min-h-[2.25rem] w-full cursor-pointer items-center justify-start gap-4 truncate rounded-md border border-solid border-[rgba(0,0,0,0.08)] bg-[unset] px-5 py-2.5 text-sm font-normal leading-none tracking-[0.5px] text-black outline-none duration-100 [transition-property:background-color,_border-color,_color,_fill,_stroke,_opacity,_box-shadow,_transform] hover:bg-neutral-2"
                    >
                      <span className="flex flex-[0_0_1.25rem] flex-row flex-nowrap items-center justify-center">
                        <Image
                          src={option.logo}
                          alt={`${option.provider} logo`}
                          className="h-auto w-5 max-w-full"
                          width={20}
                          height={20}
                        />
                      </span>
                      <div className="flex w-full w-full flex-row flex-nowrap items-center justify-start gap-2 overflow-hidden">
                        <span className="truncate text-sm font-normal leading-5 text-black">
                          Continue with{" "}
                          <span className="capitalize">{option.provider}</span>
                        </span>
                      </div>
                      <svg
                        width="20"
                        height="20"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 20 20"
                        className="h-[1em] min-h-[1rem] w-[1em] min-w-[1rem] shrink-0 text-neutral-19  opacity-0 [transition:all_100ms_ease_0s] group-hover:-translate-x-2 group-hover:opacity-100"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3.3 10h13.4m-5-5 5 5-5 5"
                        ></path>
                      </svg>
                    </button>
                  );
                })}
              </div>
              <div className="flex-norwap flex flex-row items-center justify-center">
                <div className="h-px flex-1 flex-row flex-nowrap items-stretch justify-start bg-[rgba(0,_0,_0,_0.16)]" />
                <p className="mx-4 my-0 text-[0.8125rem] font-medium leading-[1.375] text-black opacity-65">
                  or
                </p>
                <div className="h-px flex-1 flex-row flex-nowrap items-stretch justify-start bg-[rgba(0,_0,_0,_0.16)]" />
              </div>
              <button
                type="button"
                onClick={handleWalletAuth}
                className="group relative m-0 inline-flex min-h-[2.25rem] w-full cursor-pointer items-center justify-start gap-4 truncate rounded-md border border-solid border-[rgba(0,0,0,0.08)] bg-[unset] px-5 py-2.5 text-sm font-normal leading-none tracking-[0.5px] text-black outline-none duration-100 [transition-property:background-color,_border-color,_color,_fill,_stroke,_opacity,_box-shadow,_transform] hover:bg-neutral-2"
              >
                <span className=" flex flex-[0_0_1.25rem] flex-row flex-nowrap items-center justify-center">
                  <Image
                    src="providerImages/ethLogo.svg"
                    alt="wallet icon"
                    className="h-auto w-4 max-w-full"
                    width={20}
                    height={20}
                  />
                </span>
                <div className="flex w-full w-full flex-row flex-nowrap items-center justify-center gap-2 overflow-hidden">
                  <span className="truncate text-sm font-normal leading-5 text-black">
                    Continue with your crypto wallet
                  </span>
                </div>
                <svg
                  width="20"
                  height="20"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 20 20"
                  className="h-[1em] min-h-[1rem] w-[1em] min-w-[1rem] shrink-0 text-neutral-19  opacity-0 [transition:all_100ms_ease_0s] group-hover:-translate-x-2 group-hover:opacity-100"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3.3 10h13.4m-5-5 5 5-5 5"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="flex flex-row flex-nowrap items-center justify-between">
              <span className="m-0 text-[0.8125rem] leading-tight text-black opacity-65">
                No account? Signing in will sign you up.
              </span>
            </div>
          </div>
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
    </div>
  );
}
