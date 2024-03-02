import { type Objective, type Tier } from "@prisma/client";

interface ConfirmERC20SettingsProps {
  objectives: Objective[];
  tiers: Tier[];
  setERC20EscrowSettings: () => Promise<void>;
}

export default function ConfirmERC20EscrowSettings({
  objectives,
  tiers,
  setERC20EscrowSettings,
}: ConfirmERC20SettingsProps) {
  return <div>ConfirmERC20EscrowSettings</div>;
}
