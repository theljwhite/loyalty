export const shortenEthereumAddress = (
  address: string,
  startSlice: number,
  endSlice: number,
) => {
  const front = address.slice(0, startSlice);
  const mid = "...";
  const end = address.slice(-endSlice);
  const shortenedAddress = front + mid + end;
  return shortenedAddress;
};

export default shortenEthereumAddress;
