export const LEADING_ZERO_REGEX = /^0[0-9].*$/;
export const ETHEREUM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
export const ETHEREUM_ADDRESS_LIST_REGEX =
  /^0x[a-fA-F0-9]{40}(?:,0x[a-fA-F0-9]{40})?$/;
export const STRIP_SPECIAL_CHARS_REGEX = /[!@#$%^&*|()]/g;
export const SPACE_BETWEEN_CAPITALS_REGEX = /([a-z])([A-Z])/g;

export const NUMBERS_SEPARATED_BY_COMMAS_REGEX = /^\d+(,\d+)*$/;
export const NUMBERS_ONLY_REGEX = /^[0-9]*$/;
export const NUMBERS_OR_FLOATS_SEPARATED_BY_COMMAS_REGEX =
  /^(\d+(\.\d+)?)(,\s*\d+(\.\d+)?)*$/;
export const NUMBERS_OR_FLOATS_ONLY_REGEX = /^\d+(\.\d+)?$/;

export const SPACE_BETWEEN_CAPITALS_REPLACE = (str: string) =>
  str.replace(SPACE_BETWEEN_CAPITALS_REGEX, "$1 $2");
//...etc

export const MAYBE_VALID_BASE64 =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
