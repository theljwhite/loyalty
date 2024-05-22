import { useState } from "react";
import {
  didUserReject,
  handleError,
  handleEscrowContractError,
  handleERC20EscrowContractError,
} from "~/utils/error";
import { dismissToast, toastError } from "~/components/UI/Toast/Toast";

//TODO: some of this can be made less repetitive but works for now,
//allows them all to be called standalone based on what needs accounted for

export function useError(): {
  error: string;
  handleErrorFlow: (e: any, message: string) => void;
  handleEscrowError: (e: any, message: string) => void;
  handleERC20EscrowError: (e: any, message: string) => void;
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

    const commonEscrowError = handleEscrowContractError(e);

    if (commonEscrowError.codeFound) {
      setError(commonEscrowError.message);
      toastError(commonEscrowError.message);
      return;
    }

    setError(message);
    toastError(message);
  };

  const handleERC20EscrowError = (e: any, message: string) => {
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

    const escrowRelatedError = handleERC20EscrowContractError(e, message);

    if (escrowRelatedError.codeFound) {
      setError(escrowRelatedError.message);
      toastError(escrowRelatedError.message);
      return;
    }

    setError(message);
    toastError(message);
  };

  return { error, handleErrorFlow, handleEscrowError, handleERC20EscrowError };
}
