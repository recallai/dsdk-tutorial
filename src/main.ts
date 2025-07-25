import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { initializeRecallAiSdk } from './server/lib/initializeRecallAiSdk';
import { getState } from './server/config/state';
import { State } from './StateSchema';
import z from 'zod';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  mainWindow = createWindow();
  initializeRecallAiSdk();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle('request-from-renderer', async (_, data) => {
  const { command } = z.object({ command: z.string() }).parse(data);
  switch (command) {
    case 'retrieve_state': {
      return getState();
    }
    default: {
      return 'invalid command';
    }
  }

  throw new Error(`Invalid command: ${command}`);
});

export const sendStateToRenderer = (state: State) => {
  if (!mainWindow) {
    throw new Error('Main window not found');
  }
  console.log(`ℹ️ renderer <-- main: ${JSON.stringify(state)}`);
  mainWindow.webContents.send('message-from-main', state);
}

