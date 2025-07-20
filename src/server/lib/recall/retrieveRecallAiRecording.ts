import { env } from "../../config/env";

/**
 * Retrieves a Recall.ai recording by its desktop SDK upload ID.
 */
export const retrieveRecallAiRecording = async (desktopSdkUploadId: string) => {
    const url = `${env.RECALLAI_BASE_URL}/api/v1/recording/?desktop_sdk_upload_id=${desktopSdkUploadId}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `${env.RECALLAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
    });

    if (!response.ok) {
        let error = await response.text();
        throw new Error(`Failed to get Recall.ai recording: ${error}`);
    }

    // This should only contain one recording in the list as sdk uploads are unique
    const data = await response.json();
    return data.results[0];
}
