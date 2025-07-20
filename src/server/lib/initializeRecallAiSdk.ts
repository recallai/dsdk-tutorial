import RecallAiSdk from '@recallai/desktop-sdk';
import { env } from '../config/env';
import { ipcMain } from 'electron';
import { InitialStateValue, State, StateSchema } from './state';
import Store from 'electron-store';
import { sendStateToRenderer } from '../../main';

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
            case 'retrieve_state': {
                // State will be sent at the end of the function
                break;
            }
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
} 