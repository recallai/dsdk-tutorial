import RecallAiSdk from '@recallai/desktop-sdk';
import { env } from '../config/env';
import { ipcMain } from 'electron';

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
            default: {
                console.log(`⚠️ Unsupported command: ${arg.command}`);
                break;
            }
        }
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