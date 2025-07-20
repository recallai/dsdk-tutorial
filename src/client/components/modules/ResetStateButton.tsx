import { Button } from "../ui/Button";
import { api } from "../../lib/api";
import { useSdkState } from "../contexts/SdkStateContext";

export const ResetStateButton = () => {
  const { sdkState } = useSdkState();

  return (
    <Button
      disabled={sdkState.isRecording}
      onClick={() => {
        api.send("message-from-renderer", { command: "reset_state" });
      }}
    >
      Reset State
    </Button>
  );
};
