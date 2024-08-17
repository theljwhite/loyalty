import { useState } from "react";
import { DID_TYPE_CONFIRM } from "~/constants/regularExpressions";

export default function useConfirmAction() {
  const [confirmEntry, setConfirmEntry] = useState<string>("");
  const [confirmValid, setConfirmValid] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  const onConfirmChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setConfirmEntry(e.target.value);
    setConfirmValid(DID_TYPE_CONFIRM(e.target.value));
  };

  const closeConfirm = (): void => {
    setConfirmOpen(false);
    setConfirmEntry("");
    setConfirmValid(false);
  };

  return {
    confirmEntry,
    confirmValid,
    confirmOpen,
    closeConfirm,
    setConfirmOpen,
    onConfirmChange,
  };
}
