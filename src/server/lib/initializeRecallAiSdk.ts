import RecallAiSdk from '@recallai/desktop-sdk';
import { env } from '../config/env';
import { ipcMain } from 'electron';
import { getState, updateState, getLatestMeeting, setLatestMeeting, resetState } from '../config/state';
import { sendStateToRenderer } from '../../main';
import { createRecallAiDesktopSdkUpload } from './recall/createRecallAiDesktopSdkUpload';
import { retrieveRecallAiRecording } from './recall/retrieveRecallAiRecording';
import { getSummary } from './getSummary';
import { parseTranscript } from './parseTranscript';
import { State } from '../../StateSchema';

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
                resetState();
                break;
            }
            case 'start_recording': {
                resetState();

                if (!getState().windowId) {
                    throw new Error('There is no meeting in progress')
                }

                const data = await createRecallAiDesktopSdkUpload();
                RecallAiSdk.startRecording({
                    windowId: getState().windowId,
                    uploadToken: data.upload_token
                });
                updateState({ isRecording: true, sdkUpload: data });
                console.log(`Started recording. upload token: ${data.upload_token}`);
                break;
            }
            case 'stop_recording': {
                if (!getState().isRecording) {
                    throw new Error('There is no recording in progress')
                }
                const windowId = getState().windowId;
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

    /** == Meeting detection events == */

    // When a meeting is detected, set the meeting state
    RecallAiSdk.addEventListener('meeting-detected', async (evt) => {
        setLatestMeeting(evt);
        if (!getState().windowId) {
            console.log("Meeting detected, setting meeting state", evt);
            updateState({ windowId: evt.window.id });
        } else {
            console.log("Meeting already detected, skipping", evt);
        }
        sendStateToRenderer(getState());
    });

    // The meeting client has closed (i.e. the user has left the meeting or the zoom client has been closed)
    RecallAiSdk.addEventListener('meeting-closed', async (evt) => {
        console.log("Meeting closed, clearing meeting state", evt);
        updateState({ windowId: null, isRecording: false });
        sendStateToRenderer(getState());
    });

    /** ====== Recording events ====== */

    // Upload the recording to Recall.ai when the recording has ended
    RecallAiSdk.addEventListener('recording-ended', async (evt) => {
        console.log("Recording ended, uploading recording", evt);
        RecallAiSdk.uploadRecording({ windowId: evt.window.id });
        sendStateToRenderer(getState());
    });

    // The status of the recording upload progress
    RecallAiSdk.addEventListener('upload-progress', async (evt) => {
        if (evt.progress % 25 === 0) {
            console.log(`🔄 Uploading recording to Recall.ai: ${evt.progress}%`, evt);
        }

        if (evt.progress === 100 && getState().windowId === evt.window.id) {
            console.log(`✅ Completed uploading recording to Recall.ai`, evt);

            const newState: Partial<State> = {};

            // Query data associated with this recording
            const recording = await retrieveRecallAiRecording(getState().sdkUpload.id);
            const transcript = await parseTranscript(recording.media_shortcuts.transcript.data.download_url);
            const summary = await getSummary(transcript.map((t) => t.text).join(' '));

            if (recording) {
                newState.recording = recording;
                newState.videoUrl = recording.media_shortcuts.video_mixed.data.download_url;
                newState.transcript = transcript;
                newState.summary = summary;
            }
            updateState(newState);
            sendStateToRenderer(getState());
        }
    });
} 