import { RecordingButton } from "../components/modules/RecordingButton";
import { ResetStateButton } from "../components/modules/ResetStateButton";
import { SdkState } from "../components/modules/SdkState";
import { VideoPlayer } from "../components/modules/VideoPlayer";
import { Transcript } from "../components/modules/Transcript";
import { AiSummary } from "../components/modules/AiSummary";

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 items-center py-10">
      <h1 className="text-2xl font-bold">Recording App</h1>

      <SdkState />

      <div className="flex flex-row gap-5">
        <RecordingButton />
        <ResetStateButton />
      </div>

      <VideoPlayer />
      <Transcript />
      <AiSummary />
    </div>
  );
};
