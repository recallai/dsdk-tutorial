import RecallAiSdk from '@recallai/desktop-sdk';
import { env } from '../config/env';
import { ipcMain } from 'electron';
import { InitialStateValue, State, StateSchema } from './state';
import Store from 'electron-store';
import { sendStateToRenderer } from '../../main';
import { createRecallAiDesktopSdkUpload } from './recall/createRecallAiDesktopSdkUpload';
import { retrieveRecallAiRecording } from './recall/retrieveRecallAiRecording';
import { getSummary } from './getSummary';
import { parseTranscript } from './parseTranscript';

/**
 * ==================================
 * State
 * ==================================
 */

const store = new Store();

export const getState = (): State => StateSchema.parse(
    store.get('state') || InitialStateValue
);

const updateState = (updates: Partial<State>) => {
    store.set('state', { ...getState(), ...updates });
};

const getLatestMeeting = (): State['meeting'] | null => {
    return store.get('latestMeeting') as State['meeting'] | null;
}

const setLatestMeeting = (meeting: State['meeting']) => {
    store.set('latestMeeting', meeting);
}


/**
 * ==================================
 * Recall.ai SDK
 * ==================================
 */
export function initializeRecallAiSdk() {
    /**
     * ==================================
     * Recall.ai SDK initialization
     * ==================================
     */

    RecallAiSdk.init({
        apiUrl: env.RECALLAI_BASE_URL,
        acquirePermissionsOnStartup: ["accessibility", "screen-capture", "microphone"],
        restartOnError: true
    });

    console.log('Recall.ai SDK Initialized');

    /**
     * ==================================
     * Messages from the renderer process
     * ==================================
     */

    ipcMain.on('message-from-renderer', async (_, arg) => {
        console.log(`ℹ️ renderer --> main: ${arg.command}`);
        switch (arg.command) {
            case 'reset_state': {
                updateState({
                    ...InitialStateValue,
                    // Overwrite the existing meeting window with the latest one
                    meeting: getLatestMeeting(),
                    // Don't want to reset permissions if they've already been granted
                    permissions_granted: getState().permissions_granted
                });

                // State will be sent at the end of the function
                break;
            }
            case 'start_recording': {
                if (!getState().meeting) {
                    throw new Error('There is no meeting in progress')
                }

                const data = await createRecallAiDesktopSdkUpload();
                RecallAiSdk.startRecording({
                    windowId: getState().meeting.window.id,
                    uploadToken: data.upload_token
                });
                updateState({
                    isRecording: true,
                    meeting: {
                        ...getState().meeting,
                        uploadToken: data.upload_token,
                        sdkUploadId: data.id
                    }
                });
                console.log(`Started recording. upload token: ${data.upload_token}`);
                break;
            }
            case 'stop_recording': {
                if (!getState().isRecording) {
                    throw new Error('There is no recording in progress')
                }
                const windowId = getState().meeting.window.id;
                if (!windowId) {
                    throw new Error('There is no window id in the state')
                }
                RecallAiSdk.stopRecording({ windowId });
                updateState({ isRecording: false });
                console.log('Stopped recording');
                break;
            }
            default: {
                console.log(`⚠️ Unsupported command: ${arg.command}`);
                break;
            }
        }

        sendStateToRenderer(getState());
    });

    /**
     * ==================================
     * Listeners for Recall.ai SDK events
     * ==================================
     */

    /** ======== Error events ======== */

    RecallAiSdk.addEventListener('error', async (evt) => {
        let { type, message } = evt;
        console.error("ERROR: ", type, message);
    });

    /** ===== Permissions events ===== */

    // When permissions are granted, set the permissions state
    RecallAiSdk.addEventListener('permissions-granted', async (evt) => {
        console.log("Permissions granted, ready to record", evt);
        updateState({ permissions_granted: true });
        sendStateToRenderer(getState());
    });

    /** == Meeting detection events == */

    // When a meeting is detected, set the meeting state
    RecallAiSdk.addEventListener('meeting-detected', async (evt) => {
        setLatestMeeting(evt);
        if (!getState().meeting) {
            console.log("Meeting detected, setting meeting state", evt);
            updateState({ meeting: evt });
        } else {
            console.log("Meeting already detected, skipping", evt);
        }
        sendStateToRenderer(getState());
    });

    // The meeting client has closed (i.e. the user has left the meeting or the zoom client has been closed)
    RecallAiSdk.addEventListener('meeting-closed', async (evt) => {
        console.log("Meeting closed, clearing meeting state", evt);
        updateState({ meeting: null, isRecording: false });
        sendStateToRenderer(getState());
    });

    /** ====== Recording events ====== */

    // Manages the recording state as the sdk recording state changes
    RecallAiSdk.addEventListener('sdk-state-change', (event) => {
        console.log("recording state changed", event);
        try {
            switch (event.sdk.state.code) {
                case 'recording': {
                    updateState({ isRecording: true });
                    break;
                }
                case 'idle': {
                    updateState({ isRecording: false });
                    break;
                }
            }
        } catch (e) {
            console.error(e);
        }
        sendStateToRenderer(getState());
    });

    // Upload the recording to Recall.ai when the recording has ended
    RecallAiSdk.addEventListener('recording-ended', async (evt) => {
        console.log("Recording ended, uploading recording", evt);
        RecallAiSdk.uploadRecording({ windowId: evt.window.id });
        sendStateToRenderer(getState());
    });

    // The status of the recording upload progress
    RecallAiSdk.addEventListener('upload-progress', async (evt) => {
        if (evt.progress === 100) {
            const meeting = getState().meeting;

            if (meeting?.window?.id === evt.window.id) {
                console.log(`✅ Completed uploading recording to Recall.ai`, evt);

                const newState: Partial<State> = { meeting: { ...meeting, uploadPercentage: evt.progress } };

                // Query data associated with this recording
                const recording = await retrieveRecallAiRecording(meeting.sdkUploadId);
                const transcript = await parseTranscript(recording.media_shortcuts.transcript.data.download_url);
                const summary = await getSummary(transcript.map((t) => t.text).join(' '));

                if (recording) {
                    newState.recording = recording;
                    newState.videoUrl = recording.media_shortcuts.video_mixed.data.download_url;
                    newState.transcript = transcript;
                    newState.summary = summary;
                }
                updateState(newState);
            }
            sendStateToRenderer(getState());
        }

    });

} 