import { useState } from "react";
import {
  didUserReject,
  handleError,
  handleEscrowContractError,
  handleERC20EscrowContractError,
  handleLoyaltyContractError,
} from "~/utils/error";
import { dismissToast, toastError } from "~/components/UI/Toast/Toast";

//TODO: some of this can be made less repetitive but works for now,
//allows them all to be called standalone based on what needs accounted for

type ErrorHandler = (e: any, message: string) => void;

export function useError(): {
  error: string;
  handleErrorFlow: ErrorHandler;
  handleLoyaltyError: ErrorHandler;
  handleEscrowError: ErrorHandler;
  handleERC20EscrowError: ErrorHandler;
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

  const handleLoyaltyError = (e: any, message: string) => {
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

    const loyaltyContractError = handleLoyaltyContractError(e, message);

    if (loyaltyContractError.codeFound) {
      setError(loyaltyContractError.message);
      toastError(loyaltyContractError.message);
      return;
    }

    setError(message);
    toastError(message);
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

  return {
    error,
    handleErrorFlow,
    handleLoyaltyError,
    handleEscrowError,
    handleERC20EscrowError,
  };
}
