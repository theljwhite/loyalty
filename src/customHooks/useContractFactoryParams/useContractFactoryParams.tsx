import { useDeployEscrowStore } from "../useDeployEscrow/store";
import LoyaltyERC20Escrow from "~/contractsAndAbis/ERC20Escrow/LoyaltyERC20Escrow.json";
import LoyaltyERC721Escrow from "~/contractsAndAbis/ERC721Escrow/LoyaltyERC721Escrow.json";
import LoyaltyERC1155Escrow from "~/contractsAndAbis/ERC1155Escrow/LoyaltyERC1155Escrow.json";

export function useContractFactoryParams() {
  const { escrowType } = useDeployEscrowStore();

  let factoryParams: { abi: any; bytecode: any } = {
    abi: null,
    bytecode: null,
  };
  if (escrowType === "ERC20") {
    factoryParams = {
      abi: LoyaltyERC20Escrow.abi,
      bytecode: LoyaltyERC20Escrow.bytecode,
    };
  }
  if (escrowType === "ERC721") {
    factoryParams = {
      abi: LoyaltyERC721Escrow.abi,
      bytecode: LoyaltyERC721Escrow.bytecode,
    };
  }
  if (escrowType === "ERC1155") {
    factoryParams = {
      abi: LoyaltyERC1155Escrow.abi,
      bytecode: LoyaltyERC1155Escrow.bytecode,
    };
  }
  return factoryParams;
}
