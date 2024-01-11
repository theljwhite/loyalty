import { createContext, useContext, useRef } from "react";
import { createStore, useStore } from "zustand";

type ContractFactoryStatus = "IDLE" | "LOADING" | "SUCCESS" | "ERROR";

export interface ContractFactory {
  status: ContractFactoryStatus;
  data: any;
  error: string;
  setData: (value: any) => void;
  setStatus: (state: ContractFactoryStatus) => void;
  setError: (message: string) => void;
}

export const createContractFactoryStore = () =>
  createStore<ContractFactory>((set) => ({
    status: "IDLE",
    data: null,
    error: "",
    setError: (message) => set({ error: message }),
    setData: (value) => set({ data: value }),
    setStatus: (state) => set({ status: state }),
  }));

export const ContractFactoryContext = createContext<ReturnType<
  typeof createContractFactoryStore
> | null>(null);

export function ContractFactoryWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<ReturnType<typeof createContractFactoryStore>>();
  if (!storeRef.current) {
    storeRef.current = createContractFactoryStore();
  }
  return (
    <ContractFactoryContext.Provider value={storeRef.current}>
      {children}
    </ContractFactoryContext.Provider>
  );
}

export function useContractFactoryStore<T>(
  selector: (state: ContractFactory) => T,
) {
  const store = useContext(ContractFactoryContext);
  if (!store) throw new Error("Forgot to use contract factory wrapper");
  return useStore(store, selector);
}
