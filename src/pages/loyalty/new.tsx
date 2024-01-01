import React, { useState } from "react";
import CreateStepOne from "~/components/CreateLoyalty/CreateStepOne";
import { ContractFactoryWrapper } from "~/customHooks/useContractFactory";

export default function NewLoyaltyProgram() {
  return (
    <>
      <ContractFactoryWrapper>
        <div>
          <h1>create loyalty program</h1>
          <span>this page is not yet styled</span>
          <CreateStepOne />
        </div>
      </ContractFactoryWrapper>
    </>
  );
}
