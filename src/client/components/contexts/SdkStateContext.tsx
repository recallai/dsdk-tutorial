import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { State, InitialStateValue } from "../../../StateSchema";

const SdkStateContext = createContext<{ sdkState: State }>({
  sdkState: InitialStateValue,
});

export const SdkStateProvider = ({ children }: { children: ReactNode }) => {
  const [sdkState, setSdkState] = useState(InitialStateValue);

  useEffect(() => {
    window.electron.ipcRenderer
      .invoke("request-from-renderer", { command: "retrieve_state" })
      .then((initialState: State) => {
        console.log(`ℹ️ renderer <-- main: ${JSON.stringify(initialState)}`);
        setSdkState(initialState);
      });

    const cleanup = window.electron.ipcRenderer.on(
      "message-from-main",
      (state: State) => {
        console.log(`renderer <-- main: ${JSON.stringify(state)}`);
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
