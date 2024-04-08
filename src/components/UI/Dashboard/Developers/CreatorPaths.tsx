import { useState } from "react";
import DashboardSingleInputBox from "../DashboardSingleInputBox";
import DashboardSimpleInputModal from "../DashboardSimpleInputModal";

//TODO - this is heavily unfinished

export default function CreatorPaths() {
  const [domain, setDomain] = useState<string>("");
  const [paths, setPaths] = useState<string[]>([]);
  return (
    <>
      <DashboardSingleInputBox
        title="Application homepage"
        description={`The domain in which ${process.env.NEXT_PUBLIC_PROJECT_NAME} API or SDK requests will originate from (your website/app).`}
        placeholder="(e.g. https://mywebsitename.com)"
        stateVar="test"
        isValid={true}
        errorState="true"
        onChange={() => console.log("here")}
        disableCondition={false}
        isRequiredField
      />
    </>
  );
}
