import { IpcRenderer } from "../../preload";

declare global {
    interface Window {
        electron: {
            ipcRenderer: IpcRenderer;
        }
    }
}

export const api = window.electron.ipcRenderer;
