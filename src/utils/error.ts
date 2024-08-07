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

export enum SharedEscrowErrorCodes {
  DepositPeriodMustBeAtLeastOneHour = "DepositPeriodMustBeAtLeastOneHour",
  DepositEndDateExceedsProgramEnd = "DepositEndDateExceedsProgramEnd",
  DepositPeriodNotActive = "DepositPeriodNotActive",
  DepositPeriodMustBeFinished = "DepositPeriodMustBeFinished",
  CannotBeEmptyAmount = "CannotBeEmptyAmount",
  InsuffEscrowBal = "InsuffEscrowBal",
  TiersMustBeActive = "TiersMustBeActive",
}

export enum LoyaltyProgramErrorCodes {
  ProgramMustBeActive = "ProgramMustBeActive",
  ProgramDurationTooShort = "ProgramDurationTooShort",
  OnlyCreatorCanCall = "OnlyCreatorCanCall",
  OnlyCreatorOrRelay = "OnlyCreatorOrRelay",
  ConstructorArrMismatch = "ConstructorArrMismatch",
}

export enum ERC20EscrowErrorCodes {
  MustUseValidObjectiveIndex = "MustUseValidObjectiveIndex",
  MustUseValidTierIndex = "MustUseValidTierIndex",
  ObjectivesAndPayoutLengthMismatch = "ObjectivesAndPayoutLengthMismatch",
  TiersAndPayoutLengthMismatch = "TiersAndPayoutLengthMismatch",
  TierIndex0CannotPayout = "TierIndex0CannotPayout",
  InsufficientFunds = "InsufficientFunds",
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

const loyaltyContractErrorMessages: {
  [key in LoyaltyProgramErrorCodes]?: string;
} = {
  [LoyaltyProgramErrorCodes.ProgramMustBeActive]:
    "Program state must be Active to perform this action",
  [LoyaltyProgramErrorCodes.ProgramDurationTooShort]:
    "Program length must be at least 1 day",
  [LoyaltyProgramErrorCodes.OnlyCreatorCanCall]:
    "Must be the contract creator to perform this action. Are you on the correct wallet account?",
  [LoyaltyProgramErrorCodes.OnlyCreatorOrRelay]:
    "Unauthorized to perform this action. Must be the contract creator or verified relayer to perform this action.",
  [LoyaltyProgramErrorCodes.ConstructorArrMismatch]:
    "Deployment failed. Points and objectives arrays must be the same length.",
};

const commonEscrowErrorMessages: { [key in SharedEscrowErrorCodes]?: string } =
  {
    [SharedEscrowErrorCodes.DepositPeriodMustBeAtLeastOneHour]:
      "Please specify a deposit period end date of at least one hour in the future.",
    [SharedEscrowErrorCodes.DepositEndDateExceedsProgramEnd]:
      "You chose a deposit end date that exceeds your program end date.",
    [SharedEscrowErrorCodes.DepositPeriodNotActive]:
      "Your contract is not in its deposit period - cannot perform this action.",
    [SharedEscrowErrorCodes.DepositPeriodMustBeFinished]:
      "Deposit period must be finished to set escrow settings",
    [SharedEscrowErrorCodes.CannotBeEmptyAmount]:
      "You entered an amount of 0. Cannot be 0.",
    [SharedEscrowErrorCodes.InsuffEscrowBal]:
      "Insufficient escrow token balance to use an inputted amount",
    [SharedEscrowErrorCodes.TiersMustBeActive]:
      "Tiers must be active to perform this action",
  };

const erc20EscrowErrorMessages: { [key in ERC20EscrowErrorCodes]?: string } = {
  [ERC20EscrowErrorCodes.MustUseValidObjectiveIndex]:
    "Objective is out of range. Objectives are zero index based, but index cannot exceed length of objectives.",
  [ERC20EscrowErrorCodes.MustUseValidTierIndex]:
    "Inputted tier index is out of range or 0.",
  [ERC20EscrowErrorCodes.TierIndex0CannotPayout]:
    "Invalid tier. Tiers are zero index based, but tier 0 cannot be used to payout.",
  [ERC20EscrowErrorCodes.ObjectivesAndPayoutLengthMismatch]:
    "Must use the same number of amounts as number of objectives.",
  [ERC20EscrowErrorCodes.TiersAndPayoutLengthMismatch]:
    "For the selected reward condition, must have same amount of payouts as tiers",
  [ERC20EscrowErrorCodes.InsufficientFunds]:
    "Your balance is insufficient to withdraw this amount",
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

export const handleLoyaltyContractError = (
  error: any,
  fallbackMsg?: string,
): { message: string; codeFound: boolean } => {
  const matchingCustomError = extractCustomContractErrorFromThrown(error);

  if (matchingCustomError && matchingCustomError in LoyaltyProgramErrorCodes) {
    const errorMessage =
      loyaltyContractErrorMessages[
        matchingCustomError as keyof typeof LoyaltyProgramErrorCodes
      ]!;

    return {
      message: errorMessage,
      codeFound: true,
    };
  }
  return {
    message: fallbackMsg ?? "Loyalty contract call failed",
    codeFound: false,
  };
};

export const handleEscrowContractError = (
  error: any,
  fallbackMsg?: string,
): {
  message: string;
  codeFound: boolean;
} => {
  const matchingCustomError = extractCustomContractErrorFromThrown(error);

  if (matchingCustomError && matchingCustomError in SharedEscrowErrorCodes) {
    const errorMessage =
      commonEscrowErrorMessages[
        matchingCustomError as keyof typeof SharedEscrowErrorCodes
      ]!;

    return {
      message: errorMessage,
      codeFound: true,
    };
  }

  return {
    message: fallbackMsg ?? "Escrow contract call failed",
    codeFound: false,
  };
};

export const handleERC20EscrowContractError = (
  error: any,
  fallbackMsg: string,
): {
  message: string;
  codeFound: boolean;
} => {
  const commonEscrowError = handleEscrowContractError(error);

  if (commonEscrowError.codeFound) {
    return { message: commonEscrowError.message, codeFound: true };
  }

  const matchingERC20EscrowError = extractCustomContractErrorFromThrown(error);

  if (
    matchingERC20EscrowError &&
    matchingERC20EscrowError in ERC20EscrowErrorCodes
  ) {
    const errorMessage =
      erc20EscrowErrorMessages[
        matchingERC20EscrowError as keyof typeof ERC20EscrowErrorCodes
      ]!;

    return { message: errorMessage, codeFound: true };
  }

  return { message: fallbackMsg, codeFound: false };
};

export function isKnownErrorCodeMessage(message: string): boolean {
  return Object.values(errorMessages).includes(message);
}

export const extractCustomContractErrorFromThrown = (
  error: any,
): string | undefined => {
  const errorMessage = String(error);
  if (errorMessage.includes("ContractFunctionExecutionError")) {
    const wagmiErrorRegex = /Error: ([\w\d]+)\(\)/;
    const errorMatch = errorMessage.match(wagmiErrorRegex);

    return errorMatch ? errorMatch[1] : undefined;
  }
};
