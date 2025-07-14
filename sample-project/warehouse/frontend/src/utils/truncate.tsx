export const truncateAddress = (address: any) => {
  if (address?.length <= 10) return address;
  return `${address?.slice(0, 6)}...${address?.slice(-4)}`;
};

export const truncateAddressSecond = (address: string) => {
  if (address?.length <= 7) return address;
  return `${address?.slice(0, 7)}`;
};

export const truncateAddressEnded = (address: any) => {
  if (address?.length <= 20) return address;
  return `${address?.slice(0, 20)}...`;
};
