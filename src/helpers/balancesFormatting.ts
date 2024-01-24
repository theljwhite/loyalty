import { STRIP_SPECIAL_CHARS_REGEX } from "~/constants/regularExpressions";

const MAX_SYMBOL_LENGTH = 9;
export const formatTokenSymbol = (symbol: string): string => {
  const strippedSpecialChars = symbol
    .trim()
    .replace(STRIP_SPECIAL_CHARS_REGEX, "");
  if (symbol.length >= MAX_SYMBOL_LENGTH) {
    return `$${strippedSpecialChars.slice(0, MAX_SYMBOL_LENGTH)}...`;
  }
  return `$${strippedSpecialChars}`;
};
