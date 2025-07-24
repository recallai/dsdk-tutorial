# DSDK Tutorial: Desktop Notetaker

This is a desktop notetaker application built with Electron and powered by the Recall.ai Desktop SDK. It's a notetaker desktop app that demonstrates how to capture and process audio from your system.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en) and npm

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/recallai/dsdk-tutorial.git
    cd dsdk-tutorial
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Run the application:**

    ```bash
    npm run start
    ```

    This will launch the Electron application on your desktop.

## Architecture

This application follows a standard Electron architecture, which consists of three main parts: a Main process, a Renderer process, and a Preload script to bridge them.

- The **Main Process** is the backend of the application, running in a Node.js environment. It has access to system resources and is responsible for initializing and managing the Recall.ai Desktop SDK.
- The **Renderer Process** is the user interface, a React application running in a browser window.

### Important Files

Here is a guide to the key files related to the Recall.ai integration:

#### Server (Main Process)

- `src/main.ts`: The entry point for the Electron main process. It creates the application window and sets up IPC (Inter-Process Communication) handlers to listen for events from the UI.
- `src/server/lib/initializeRecallAiSdk.ts`: This is where all of the Recall.ai Desktop SDK is configured and initialized. It contains the core logic for the desktop SDK **and is the entirety of what the desktop sdk tutorial covers**
- `src/server/lib/recall/createRecallAiDesktopSdkUpload.ts`: Creates a reference for a new recording and returns an `upload_token` that the Desktop SDK uses to stream data to Recall.ai's servers.
- `src/server/lib/recall/retrieveRecallAiRecording.ts`: A helper function for retrieving the final recording data from the Recall.ai API after a recording is complete.
- `src/server/lib/parseTranscript.ts`: Fetches the raw transcript data from the download URL and formats it by combining words into utterances for each speaker.

#### Client (Renderer Process)

- `src/client/components/contexts/SdkStateContext.tsx`: Contains the listener for changes to the state from the main process. The UI updates based on the contents of this state
- `src/client/components/modules/RecordingButton.tsx`: Sends the start/stop recording command to the main process. Starts and ends the recording flow
