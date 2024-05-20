import { useState } from "react";
import {
  didUserReject,
  handleError,
  handleEscrowContractError,
} from "~/utils/error";
import { dismissToast, toastError } from "~/components/UI/Toast/Toast";

export function useError(): {
  error: string;
  handleErrorFlow: (e: any, message: string) => void;
  handleEscrowError: (e: any, message: string) => void;
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

  const handleEscrowError = (e: any, message: string) => {
    if (didUserReject(e)) {
      dismissToast();
      return;
    }

    const handledError = handleError(e);

    if (handledError.codeFound) {
      setError(handledError.message);
      toastError(handledError.message);
      return;
    }

    const escrowError = handleEscrowContractError(e);
    const escrowErrorMessage = escrowError ? escrowError : message;
    setError(escrowErrorMessage);
    toastError(escrowErrorMessage);
  };

  return { error, handleErrorFlow, handleEscrowError };
}
