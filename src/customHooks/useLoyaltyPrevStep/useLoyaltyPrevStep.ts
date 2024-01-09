import { useDeployLoyaltyStore } from "../useDeployLoyalty/store";

export const usePreviousLoyaltyStep = () => {
  const { step, setStep } = useDeployLoyaltyStore();

  const goPreviousStep = (): void => {
    if (step > 0) {
      const previousStep = step - 1;
      setStep(previousStep);
    }
  };

  return goPreviousStep;
};
