import { env } from "../../config/env";

/**
 * Creates a new Recall.ai desktop SDK upload.
 * This is a reference to the recording you will be uploading.
 */
export const createRecallAiDesktopSdkUpload = async () => {
    const url = `${env.RECALLAI_BASE_URL}/api/v1/sdk-upload/`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `${env.RECALLAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            recording_config: {
                transcript: {
                    provider: {
                        recall_streaming: {}
                    }
                }
            }
        })
    });

    if (!response.ok) {
        let error = await response.text();
        throw new Error(`Failed to create Recall.ai desktop SDK upload: ${error}`);
    }

    const data = await response.json();

    if (!data.upload_token) {
        throw new Error("No upload token received from the server.");
    }

    return data;
}
