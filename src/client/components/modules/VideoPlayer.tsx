import { useEffect, useState } from "react";
import { useSdkState } from "../contexts/SdkStateContext";

export const VideoPlayer: React.FC = () => {
  const { sdkState } = useSdkState();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string;
    const fetchVideo = async () => {
      if (sdkState.videoUrl) {
        try {
          const videoBuffer = await fetch(sdkState.videoUrl).then((res) =>
            res.arrayBuffer()
          );
          const videoBlob = new Blob([videoBuffer], { type: "video/mp4" });
          objectUrl = URL.createObjectURL(videoBlob);
          setVideoUrl(objectUrl);
        } catch (error) {
          console.error("Failed to load video:", error);
        }
      } else {
        setVideoUrl(null);
      }
    };

    fetchVideo();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [sdkState.videoUrl]);

  if (!sdkState.videoUrl) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-lg overflow-hidden border border-gray-200">
        <div className="aspect-video w-full">
          {videoUrl && <video src={videoUrl} controls />}
        </div>
      </div>
    </div>
  );
};
