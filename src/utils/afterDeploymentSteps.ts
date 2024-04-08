import { RewardType } from "@prisma/client";

type AfterDeploymentStep = {
  actionNeededHere: string;
  step: string;
};

const afterDeploymentSteps: AfterDeploymentStep[] = [
  {
    actionNeededHere: "Escrow Wallet",
    step: "Specify how long you need to deposit reward tokens in Escrow Wallet",
  },
  {
    actionNeededHere: "Escrow Wallet",
    step: "Deposit tokens to be used as rewards in Escrow Wallet",
  },
  {
    actionNeededHere: "Escrow Settings",
    step: "Customize how you want to reward tokens in Escrow Settings",
  },
  {
    actionNeededHere: "Overview",
    step: "Set your loyalty program to active in Overview when ready to begin program",
  },
];

const withSDKSteps: AfterDeploymentStep[] = [
  {
    actionNeededHere: "API Keys",
    step: "Generate a once-seen API key in API Keys",
  },
  {
    actionNeededHere: "API Keys",
    step: "Generate an Entity Secret in API Keys",
  },
  { actionNeededHere: "", step: "Secure your API Key and Entity Secret" },

  {
    actionNeededHere: "Developer Console",
    step: "Register your Entity Secret Ciphertext in Developer Console",
  },
  {
    actionNeededHere: "",
    step: `Install ${process.env.NEXT_PUBLIC_PROJECT_NAME} node.js SDK for usage in your app/website`,
  },
  {
    actionNeededHere: "User Settings",
    step: "If you have users who do not have crypto wallets, you can create a Wallet Set in User Settings so that these users can earn on-chain rewards.",
  },
  {
    actionNeededHere: "",
    step: "Follow SDK Docs to set up the SDK for usage of your contracts on your own app/website, initalizing it with your Entity Secret and API Key.",
  },
];

export const getAfterDeploymentStepsNeeded = (
  rewardType: RewardType,
  loyaltyState: string,
  escrowState?: string,
  escrowAddress?: string,
): AfterDeploymentStep[] => {
  const onlyLastStep = afterDeploymentSteps.slice(-1);

  if (rewardType !== RewardType.Points && !escrowAddress) {
    const deployAction = {
      actionNeededHere: "Escrow Deploy",
      step: "Deploy your escrow contract in Escrow Deploy",
    };
    return [deployAction, ...afterDeploymentSteps];
  }

  if (rewardType !== RewardType.Points && escrowAddress) {
    if (loyaltyState === "Idle" && escrowState === "DepositPeriod") {
      const sliceFirstStep = afterDeploymentSteps.slice(1);
      return sliceFirstStep;
    }
    if (loyaltyState === "Idle" && escrowState === "AwaitingEscrowSettings") {
      const sliceFirstTwo = afterDeploymentSteps.slice(2);
      return sliceFirstTwo;
    }
    if (loyaltyState === "AwaitingEscrowSetup" && escrowState === "Idle") {
      return onlyLastStep;
    }
    if (loyaltyState === "Active" && escrowState === "InIssuance") {
      return [];
    }

    return afterDeploymentSteps;
  }

  if (rewardType === RewardType.Points) return onlyLastStep;

  return [];
};

export const getDeploymentStepsWithSDKSteps = (
  rewardType: RewardType,
  loyaltyState: string,
  escrowState?: string,
  escrowAddress?: string,
): AfterDeploymentStep[] => {
  const deploymentSteps = getAfterDeploymentStepsNeeded(
    rewardType,
    loyaltyState,
    escrowState,
    escrowAddress,
  );
  return [...deploymentSteps, ...withSDKSteps];
};
