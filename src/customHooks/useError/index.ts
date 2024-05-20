import { useState } from "react";
import { didUserReject, handleError } from "~/utils/error";
import { dismissToast, toastError } from "~/components/UI/Toast/Toast";

export function useError(): {
  error: string;
  handleErrorFlow: (e: any, message: string) => void;
} {
  const [error, setError] = useState<string>("");

  const handleErrorFlow = (e: any, message: string) => {
    if (didUserReject(e)) {
      dismissToast();
      return;
    }
    const handledError = handleError(e);
    setError(handledError.message);

    if (handledError.codeFound) {
      toastError(handledError.message);
    } else {
      toastError(message);
    }
  };
  return { error, handleErrorFlow };
}
