import { EstimateGasExecutionError } from "viem";

export enum CommonErrorCodes {
  CALL_EXCEPTION = "CALL_EXCEPTION",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  MISSING_NEW = "MISSING_NEW",
  NONCE_EXPIRED = "NONCE_EXPIRED",
  NUMERIC_FAULT = "NUMERIC_FAULT",
  REPLACEMENT_UNDERPRICED = "REPLACEMENT_UNDERPRICED",
  TRANSACTION_REPLACED = "TRANSACTION_REPLACED",
  UNPREDICTABLE_GAS_LIMIT = "UNPREDICTABLE_GAS_LIMIT",
  EXECUTION_REVERTED = "EXECUTION_REVERTED",
}

const errorMessages: { [key in CommonErrorCodes]?: string } = {
  [CommonErrorCodes.CALL_EXCEPTION]:
    "A contract call failed. Check the contract's conditions or requirements.",
  [CommonErrorCodes.INSUFFICIENT_FUNDS]:
    "You don't have enough funds for this transaction! Consider gas and data costs.",
  [CommonErrorCodes.MISSING_NEW]:
    "The 'new' keyword is missing in contract deployment.",
  [CommonErrorCodes.NONCE_EXPIRED]:
    "This nonce has been used before. Please try with a fresh nonce.",
  [CommonErrorCodes.NUMERIC_FAULT]:
    "A numeric operation resulted in an overflow or underflow.",
  [CommonErrorCodes.REPLACEMENT_UNDERPRICED]:
    "The new transaction's gas price is too low to replace the old one. Consider increasing it.",
  [CommonErrorCodes.TRANSACTION_REPLACED]:
    "This transaction was replaced by another with the same nonce, maybe due to a higher gas price.",
  [CommonErrorCodes.UNPREDICTABLE_GAS_LIMIT]:
    "Gas estimation failed. Consider setting a gas limit manually, or ensure the transaction is valid.",
  [CommonErrorCodes.EXECUTION_REVERTED]:
    "Execution reverted, which could be due to the function call failing its requirements or the transaction running out of gas.",
};

export enum SharedEscrowError {
  DepositPeriodMustBeAtLeastOneHour = "DepositPeriodMustBeAtLeastOneHour",
  DepositEndDateExceedsProgramEnd = "DepositEndDateExceedsProgramEnd",
  DepositPeriodNotActive = "DepositPeriodNotActive",
  DepositPeriodMustBeFinished = "DepositPeriodMustBeFinished",
  CannotBeEmptyAmount = "CannotBeEmptyAmount",
  InsuffEscrowBal = "InsuffEscrowBal",
}

const commonEscrowErrorMessages: { [key in SharedEscrowError]?: string } = {
  [SharedEscrowError.DepositPeriodMustBeAtLeastOneHour]:
    "Please specify a deposit period end date of at least one hour in the future",
  [SharedEscrowError.DepositEndDateExceedsProgramEnd]:
    "You chose a deposit end date that exceeds your program end date",
  [SharedEscrowError.DepositPeriodNotActive]:
    "Your contract is not in its deposit period - cannot perform this action",
};

export const didUserReject = (error: any): boolean => {
  const errorCode = error?.code ?? error.cause?.code;
  return errorCode === 4001 || errorCode === "ACTION_REJECTED";
};

export const handleError = (
  error: any,
): { message: string; codeFound: boolean } => {
  const code = error.code as CommonErrorCodes;

  const isInsufficientFundsError =
    error instanceof EstimateGasExecutionError ||
    (error.code === -32603 && error.data?.code === -32000);

  if (isInsufficientFundsError) {
    return {
      message: errorMessages[CommonErrorCodes.INSUFFICIENT_FUNDS]!,
      codeFound: true,
    };
  }

  if (
    error.message &&
    (error.message.includes("execution reverted") ||
      error.message.includes("out of gas"))
  ) {
    return {
      message: errorMessages[CommonErrorCodes.EXECUTION_REVERTED]!,
      codeFound: true,
    };
  }

  if (code in errorMessages) {
    return { message: errorMessages[code]!, codeFound: true };
  }

  return { message: error.message ?? error.reason, codeFound: false };
};

export function isKnownErrorCodeMessage(message: string): boolean {
  return Object.values(errorMessages).includes(message);
}

//TEMP until better way found to handle custom errors thrown in contract reverts
export const handleEscrowContractError = (error: any): string => {
  const errorMessage = JSON.stringify(error);
  if (errorMessage.includes("ContractFunctionExecutionError")) {
    const wagmiErrorRegex = /Error: ([\w\d]+)\(\)/;
    const errorMatch = errorMessage.match(wagmiErrorRegex);

    if (errorMatch && errorMatch[1]) {
      if (errorMatch[1] in SharedEscrowError) {
        return commonEscrowErrorMessages[
          errorMatch[1] as keyof typeof SharedEscrowError
        ]!;
      }
      return errorMatch[1];
    }
  }

  return "";
};
