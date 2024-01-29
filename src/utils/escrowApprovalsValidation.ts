import { ETHEREUM_ADDRESS_REGEX } from "~/constants/regularExpressions";

export const senderInputError = (senderAddresses: string[]): string => {
  for (let i = 0; i < senderAddresses.length; i++) {
    const address = senderAddresses[i] ?? "";
    if (!ETHEREUM_ADDRESS_REGEX.test(address) && address.length > 0) {
      return "Must enter a valid contract address";
    }
  }

  return "";
};

export const rewardAddressInputError = (rewardAddress: string): string => {
  if (!ETHEREUM_ADDRESS_REGEX.test(rewardAddress) && rewardAddress.length > 0) {
    return "Must enter a valid contract address";
  }

  return "";
};
