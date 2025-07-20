import React from "react";
import { useSdkState } from "../contexts/SdkStateContext";

export const AiSummary: React.FC = () => {
  const { sdkState } = useSdkState();

  if (!sdkState.summary) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl p-4 border border-gray-200 rounded-lg">
      <h2 className="text-xl font-bold">AI Summary</h2>
      <div className="space-y-4">
        <p className="text-gray-700 whitespace-pre-wrap">{sdkState.summary}</p>
      </div>
    </div>
  );
};
