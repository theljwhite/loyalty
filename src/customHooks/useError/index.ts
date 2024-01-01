import { useState } from "react";
import { didUserReject, handleError } from "~/utils/error";

export function useError(): {
  error: string;
  handleErrorFlow: (e: any, message: string) => void;
} {
  const [error, setError] = useState<string>("");

  const handleErrorFlow = (e: any, message: string) => {
    if (didUserReject(e)) {
      //TODO handle UI
      console.log("e rejection error", e);
      return;
    }
    const handledError = handleError(e);
    setError(handledError.message);

    if (handledError.codeFound) {
      //TODO UI
      console.log("error code found", handledError.message);
    } else {
      //TODO UI
      console.log("error code not found", handledError.message);
      console.log("default message", message);
    }
  };
  return { error, handleErrorFlow };
}
