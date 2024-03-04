import { type Objective, type Tier } from "@prisma/client";

interface ConfirmERC1155EscrowProps {
  objectives: Objective[];
  tiers: Tier[];
  setERC1155EscrowSettings: () => Promise<void>;
}

export default function ConfirmERC1155EscrowSettings({
  objectives,
  tiers,
  setERC1155EscrowSettings,
}: ConfirmERC1155EscrowProps) {
  return <div>TODO: ConfirmERC1155EscrowSettings</div>;
}
