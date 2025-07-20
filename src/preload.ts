// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

export interface IpcRenderer {
    invoke: (channel: 'request-from-renderer', ...args: any[]) => Promise<any>;
    send: (channel: 'message-from-renderer', data: any) => void;
    on: (channel: 'message-from-main', func: (...args: any[]) => void) => (() => void) | undefined;
}

contextBridge.exposeInMainWorld('electron', {
    /**
     * A safe, limited version of ipcRenderer that can be used in the renderer process.
     * This object provides methods for one-way IPC (Inter-Process Communication).
     */
    ipcRenderer: {
        /**
         * Calls a function in the main process and returns the result.
         */
        invoke: (channel: 'request-from-renderer', ...args: any[]) => {
            const validChannels = ['request-from-renderer'];
            if (validChannels.includes(channel)) {
                return ipcRenderer.invoke(channel, ...args);
            }
        },

        /**
         * Sends a one-way message from the renderer process to the main process.
         */
        send: (channel: 'message-from-renderer', data: any) => {
            const validChannels = ['message-from-renderer'];
            if (validChannels.includes(channel)) {
                console.log(`ℹ️ renderer --> main: ${channel}, ${JSON.stringify(data)}`);
                ipcRenderer.send(channel, data);
            } else {
                console.error(`Invalid channel: ${channel}`);
            }
        },

        /**
         * Listens for messages from the main process to the renderer process.
         */
        on: (channel: 'message-from-main', func: (...args: any[]) => void) => {
            const validChannels = ['message-from-main'];
            if (validChannels.includes(channel)) {

                const subscription = (event: Electron.IpcRendererEvent, ...args: any[]) =>
                    func(...args);
                ipcRenderer.on(channel, subscription);

                // Return a cleanup function to remove the listener
                return () => {
                    ipcRenderer.removeListener(channel, subscription);
                };
            } else {
                console.error(`Invalid channel: ${channel}`);
            }
        },
    },
} satisfies { ipcRenderer: IpcRenderer });
