import { useSdkState } from "../contexts/SdkStateContext";

export const Transcript: React.FC = () => {
  const { sdkState } = useSdkState();

  if (!sdkState.transcript.length) return null;

  return (
    <div className="w-full max-w-2xl p-4 border border-gray-200 rounded-lg">
      <h2 className="text-xl font-bold">Transcript</h2>
      <div className="space-y-4">
        {sdkState.transcript.map((part, i) => (
          <div key={i}>
            <span className="font-semibold">
              {part.speakerName || "Unknown Speaker"}:{" "}
            </span>
            <span>{part.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
