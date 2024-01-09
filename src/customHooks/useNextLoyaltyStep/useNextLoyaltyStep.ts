import { useDeployLoyaltyStore } from "../useDeployLoyalty/store";

export const useNextLoyaltyStep = (
  validateSteps: Array<(arg?: any) => string | undefined>,
) => {
  const { step, setStep, furthestStep, setFurthestStep, setError } =
    useDeployLoyaltyStore();

  const onNextStep = (arg?: any) => {
    let isError = false;

    for (const validateStep of validateSteps) {
      const errorMessage = validateStep(arg);

      if (errorMessage) {
        setError(step, { step, message: errorMessage });
        isError = true;
        break;
      }

      if (!isError) {
        setError(step, { step, message: "" });
        const nextStep = step + 1;
        setStep(nextStep);

        if (nextStep > furthestStep) {
          setFurthestStep(nextStep);
        }
      }
    }
  };

  return onNextStep;
};
