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

## How it Works

This project is a standard Electron application built with Electron Forge.

- The main Electron process is managed by `src/main.ts`.
- The user interface is a React application, with the entry point at `src/renderer.tsx`.
- The `npm run start` command compiles and launches the application for local development.
