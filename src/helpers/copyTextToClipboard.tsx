import Image from "next/image";
import { toastError } from "~/components/UI/Toast/Toast";
import { toast } from "react-toastify";

export const copyTextToClipboard = async (
  textToCopy: string,
  message: string,
): Promise<void> => {
  try {
    await navigator.clipboard.writeText(textToCopy);
    toast(message, {
      position: "bottom-center",
      hideProgressBar: true,
      icon: (
        <Image
          width={20}
          height={20}
          alt="checkmark"
          src="/utilityImages/checkmarkOne.svg"
        />
      ),
    });
  } catch (error) {
    toastError("Could not copy text to clipboard");
  }
};
