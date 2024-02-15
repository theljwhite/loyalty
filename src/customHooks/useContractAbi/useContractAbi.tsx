import { EscrowType } from "@prisma/client";

export function useEscrowAbi(escrowType: EscrowType, version?: string) {
  const contractsVersion =
    version ?? process.env.NEXT_PUBLIC_LATEST_CONTRACT_VERSION;

  let factoryParams: { abi: any; bytecode: any } = {
    abi: null,
    bytecode: null,
  };
  if (escrowType === "ERC20") {
    factoryParams = {
      abi: require(
        `~/contractsAndAbis/${contractsVersion}/ERC20Escrow/LoyaltyERC20Escrow.json`,
      ).abi,
      bytecode: require(
        `~/contractsAndAbis/${contractsVersion}/ERC20Escrow/LoyaltyERC20Escrow.json`,
      ).bytecode,
    };
  }
  if (escrowType === "ERC721") {
    factoryParams = {
      abi: require(
        `~/contractsAndAbis/${contractsVersion}/ERC721Escrow/LoyaltyERC721Escrow.json`,
      ).abi,
      bytecode: require(
        `~/contractsAndAbis/${contractsVersion}/ERC721Escrow/LoyaltyERC721Escrow.json`,
      ).bytecode,
    };
  }
  if (escrowType === "ERC1155") {
    factoryParams = {
      abi: require(
        `~/contractsAndAbis/${contractsVersion}/ERC1155Escrow/LoyaltyERC1155Escrow.json`,
      ).abi,
      bytecode: require(
        `~/contractsAndAbis/${contractsVersion}/ERC1155Escrow/LoyaltyERC1155Escrow.json`,
      ).bytecode,
    };
  }
  return factoryParams;
}

export function useLoyaltyAbi(version?: string) {
  const contractsVersion =
    version ?? process.env.NEXT_PUBLIC_LATEST_CONTRACT_VERSION;

  return {
    abi: require(`~/contractsAndAbis/${contractsVersion}/Loyalty/Loyalty.json`)
      .abi,
    bytecode: require(
      `~/contractsAndAbis/${contractsVersion}/Loyalty/Loyalty.json`,
    ).bytecode,
  };
}
