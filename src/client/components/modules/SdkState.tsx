import { useSdkState } from "../contexts/SdkStateContext";

export const SdkState: React.FC = () => {
  const { sdkState } = useSdkState();

  return (
    <div className="w-full max-w-2xl p-4 border border-gray-200 rounded-lg">
      <h2 className="text-xl font-bold">SDK State</h2>
      <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
        <code className="font-mono text-sm">
          {JSON.stringify(sdkState, null, 2)}
        </code>
      </pre>
    </div>
  );
};
