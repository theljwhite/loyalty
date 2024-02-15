import {
  ETHEREUM_ADDRESS_REGEX,
  ETHEREUM_ADDRESS_LIST_REGEX,
} from "~/constants/regularExpressions";

//senderInput takes in a string array because in the future, the smart contracts...
//...may accept multiple sender addreses
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

export const depositorsInputError = (depositorsString: string): string => {
  const isValidAddressList = ETHEREUM_ADDRESS_LIST_REGEX.test(depositorsString);
  if (!isValidAddressList) return "Must enter valid ethereum addresses";
  return "";
};
