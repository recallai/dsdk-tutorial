import Store from 'electron-store';
import { StateSchema, InitialStateValue, State } from '../../StateSchema';

const store = new Store();

export const getState = (): State => StateSchema.parse(
    store.get('state') || InitialStateValue
);

export const updateState = (updates: Partial<State>) => {
    store.set('state', { ...getState(), ...updates });
};

export const resetState = () => updateState({
    ...InitialStateValue,
    // Overwrite the existing meeting window with the latest one
    windowId: getLatestMeeting()?.window.id,
    // Don't want to reset permissions if they've already been granted
    permissionsGranted: getState().permissionsGranted
});


type Meeting = {
    window: {
        id: string;
    }
}

export const getLatestMeeting = (): Meeting | null => {
    return store.get('latestMeeting') as Meeting | null;
}

export const setLatestMeeting = (meeting: Meeting) => {
    store.set('latestMeeting', meeting);
}

