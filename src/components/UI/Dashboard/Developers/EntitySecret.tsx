import { useState } from "react";
import { copyTextToClipboard } from "~/helpers/copyTextToClipboard";
import DashboardActionButton from "../DashboardActionButton";
import DashboardInfoBanner from "../DashboardInfoBanner";
import { ClipboardOne, EyeTransform } from "../Icons";

//TODO - trivial, but, last:child and first:child Tailwind not working so hardcoded the tab class border radius
//can also use a syntax highlighting package to make the code example prettier, but not worrying...
//...about the additional dependency for now

type LanguageOption = {
  name: string;
  codeExample: string[];
  active: boolean;
};

const languageOptions: LanguageOption[] = [
  { name: "Bash", codeExample: ["openssl rand -hex 32"], active: true },
  {
    name: "Node.js",
    codeExample: [
      "const crypto = require('crypto')",
      "const secret = crypto.randomBytes(32).toString('hex')",
      "",
      "console.log(secret)",
    ],
    active: false,
  },
  {
    name: "JavaScript",
    codeExample: [
      "const array = new Uint8Array(32)",
      "window.crypto.getRandomValues(array)",
      "const secret = Array.from(array)",
      ".map((b) => b.toString(16).padStart(2, '0'))",
      ".join('')",
      "",
      "console.log(secret)",
    ],
    active: false,
  },
  {
    name: "Python",
    codeExample: [
      "import os",
      "secret = os.urandom(32).hex()",
      "",
      "print (secret)",
    ],
    active: false,
  },
];

export default function EntitySecret() {
  const [options, setOptions] = useState<LanguageOption[]>(languageOptions);
  const [newSecret, setNewSecret] = useState<string>("");
  const [secretVisible, setSecretVisible] = useState<boolean>(false);

  const activeTabClass =
    "text-white bg-dashboard-codeSlate border border-b-dashboard-codeSlate border-l-dashboard-codeSlate";
  const inactiveTabClass =
    "bg-dashboard-codeBg border border-dashboard-codeBorder text-dashboard-codeTab hover:bg-dashboard-codeBg/50";
  const baseTabClass = "py-2 pe-4 ps-4 text-sm";

  const generateEntitySecret = (): void => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    const secret = Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    setNewSecret(secret);
  };

  const selectTab = (name: string) => {
    const selection = options.map((option) =>
      option.name === name
        ? { ...option, active: true }
        : { ...option, active: false },
    );
    setOptions(selection);
  };

  const copyCodeExample = (): string => {
    const [selectedExample] = options.filter((option) => option.active);
    if (selectedExample) {
      const code: string[] = selectedExample.codeExample;
      const codeStringWithBreaks = code
        .map((line) => (line ? `${line} \n` : line))
        .join("");

      copyTextToClipboard(
        codeStringWithBreaks,
        `Copied ${selectedExample.name} code`,
      );
    }
    return "";
  };

  return (
    <div>
      <div className="mt-8 flex flex-1 flex-row items-start rounded-2xl border border-dashboard-border1 bg-white py-8 pe-6 ps-6">
        <div className="min-w-0 flex-1">
          <div className="block flex-1">
            <div className="mb-1 flex items-center justify-start">
              <p className="text-md font-semibold leading-6 text-dashboard-body">
                Entity Secret
              </p>
            </div>
            <span className="mt-2 text-[13px] font-normal leading-[1.125] text-black opacity-65">
              Generate an Entity Secret for{" "}
              {process.env.NEXT_PUBLIC_PROJECT_NAME} API routes and SDK. Entity
              Secret is required for API routes that involve completing
              objectives on the behalf of your users, etc. It will be sent along
              with your API Key for authorizing requests.
            </span>

            <div className="mt-3">
              <DashboardInfoBanner
                info="It is recommended that you generate your own Entity Secret in the language of your choosing. However, you can also generate one from here below."
                infoType="info"
              />
            </div>

            <div className="mt-3">
              <ul className="relative mx-0 -mb-px mt-0 flex list-none flex-wrap">
                {options.map((option, index) => {
                  return (
                    <li key={index} className="">
                      <button
                        onClick={() => selectTab(option.name)}
                        type="button"
                        className={`${baseTabClass} ${
                          index === 0
                            ? "rounded-tl-md"
                            : index === options.length - 1
                              ? "rounded-tr-md"
                              : "rounded-none"
                        } ${option.active ? activeTabClass : inactiveTabClass}`}
                      >
                        {option.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="relative mb-6 block">
                <pre className="rounded-b-md rounded-r-md bg-dashboard-codeSlate py-4 text-sm">
                  <div className="relative text-dashboard-codeFile">
                    <span
                      onClick={() => copyCodeExample()}
                      className="absolute right-4 top-0 h-5 w-5 cursor-pointer flex-row gap-2"
                    >
                      <ClipboardOne color="currentColor" />
                    </span>
                  </div>
                  <code className="grid overflow-x-auto text-dashboard-codeWhite">
                    {options
                      .filter((option) => option.active)
                      .map((option, index) => {
                        return (
                          <span key={index}>
                            {option.codeExample.map((line, index) => {
                              return (
                                <span
                                  key={index}
                                  className="text-codeWhite pe-4 ps-4"
                                >
                                  {line} <br />
                                </span>
                              );
                            })}
                          </span>
                        );
                      })}
                  </code>
                </pre>
              </div>
              <div></div>
            </div>
            <div className="mt-3">
              <div className="mt-3">
                <DashboardInfoBanner
                  info="Store your Entity Secret in a safe location. Never send it via email or expose on the client. We do not store entity secrets. Learn more about the best security practices for your Entity Secret and how it is used."
                  infoType="warn"
                />
              </div>

              <div className="mt-3 flex flex-col">
                <div className="flex flex-col gap-2">
                  <div className="mb-1 flex items-center justify-start">
                    <p className="text-sm font-semibold leading-6 text-dashboard-body">
                      Generate an Entity Secret for me
                    </p>
                  </div>
                  <div className="ms-1 flex flex-1 flex-col overflow-hidden">
                    <div className="flex w-full flex-col gap-2 overflow-hidden rounded-md bg-dashboard-codeBox p-4">
                      <div className="flex w-full justify-between">
                        <div className="flex">
                          <p className="overflow-hidden truncate text-sm font-semibold leading-5 text-white">
                            Generated Entity Secret
                          </p>
                        </div>
                        <div className="ml-auto flex gap-1">
                          <button
                            onClick={() => setSecretVisible(!secretVisible)}
                            className="relative inline-flex h-auto appearance-none items-center justify-center truncate bg-transparent p-0  align-middle leading-[1.2] text-white outline-none"
                          >
                            <span className="inline-block h-5 w-5 shrink-0 leading-[1em]">
                              <EyeTransform
                                size={20}
                                color="currentColor"
                                line={secretVisible}
                              />
                            </span>
                          </button>

                          <button
                            disabled={!newSecret}
                            onClick={() =>
                              copyTextToClipboard(
                                newSecret,
                                "Copied Entity Secret",
                              )
                            }
                            className="relative inline-flex h-auto appearance-none items-center justify-center truncate bg-transparent p-0 align-middle leading-[1.2] text-white outline-none"
                          >
                            <span className="inline-block h-5 w-5 shrink-0 leading-[1em]">
                              <ClipboardOne size={20} color="currentColor" />
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="relative flex">
                        <pre
                          className={`${
                            secretVisible
                              ? "text-white"
                              : "text-transparent [text-shadow:white_0px_0px_6px]"
                          } whitespace-prewrap m-0 p-0 text-sm font-normal leading-5`}
                        >
                          {newSecret}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-center">
                  <div className="mt-3">
                    <DashboardActionButton
                      onClick={generateEntitySecret}
                      btnType="button"
                      btnText="Generate an Entity Secret"
                      isPrimary
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
