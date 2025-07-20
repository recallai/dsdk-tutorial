import { Button } from "../ui/Button";
import { api } from "../../lib/api";
import { useSdkState } from "../contexts/SdkStateContext";
import { useMemo } from "react";

export const RecordingButton = () => {
  const { sdkState } = useSdkState();

  const canStartRecording = useMemo(() => {
    return (
      !!sdkState.meeting &&
      !!sdkState.permissions_granted &&
      !sdkState.isRecording
    );
  }, [sdkState.meeting, sdkState.permissions_granted, sdkState.isRecording]);

  const canStopRecording = useMemo(() => {
    return sdkState.isRecording;
  }, [sdkState.isRecording]);

  return (
    <Button
      disabled={sdkState.isRecording ? !canStopRecording : !canStartRecording}
      onClick={() => {
        api.send("message-from-renderer", {
          command: sdkState.isRecording ? "stop_recording" : "start_recording",
        });
      }}
    >
      {sdkState.isRecording ? "Stop Recording" : "Start Recording"}
    </Button>
  );
};
