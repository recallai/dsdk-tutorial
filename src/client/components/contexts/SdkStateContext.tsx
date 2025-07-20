import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { State, InitialStateValue } from "../../../server/lib/state";

const SdkStateContext = createContext<{ sdkState: State }>({
  sdkState: InitialStateValue,
});

export const SdkStateProvider = ({ children }: { children: ReactNode }) => {
  const [sdkState, setSdkState] = useState<State>(InitialStateValue);

  useEffect(() => {
    window.electron.ipcRenderer
      .invoke("request-from-renderer", { command: "retrieve_state" })
      .then((initialState: State) => {
        console.log(
          `ℹ️ renderer <-- main (initial state): ${JSON.stringify(
            initialState
          )}`
        );
        setSdkState(initialState);
      });

    const cleanup = window.electron.ipcRenderer.on(
      "message-from-main",
      (state: State) => {
        console.log(`renderer <-- main (update): ${JSON.stringify(state)}`);
        setSdkState(state);
      }
    );

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  return (
    <SdkStateContext.Provider value={{ sdkState }}>
      {children}
    </SdkStateContext.Provider>
  );
};

export const useSdkState = () => {
  return useContext(SdkStateContext);
};
