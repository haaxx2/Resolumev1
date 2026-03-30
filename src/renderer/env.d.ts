declare global {
  interface Window {
    chaserApi: {
      getState: () => Promise<any>;
      updateSettings: (payload: unknown) => Promise<any>;
      updateChase: (payload: unknown) => Promise<any>;
      updatePanels: (payload: unknown) => Promise<any>;
      transportStart: () => Promise<void>;
      transportStop: () => Promise<void>;
      transportPause: () => Promise<void>;
      transportResume: () => Promise<void>;
      transportReset: () => Promise<void>;
      transportTap: () => Promise<void>;
      manualStep: (dir: 'next' | 'prev') => Promise<void>;
      savePresetAs: (preset: unknown) => Promise<string | null>;
      loadPreset: () => Promise<unknown>;
      deletePreset: (name: string) => Promise<void>;
      listPresets: () => Promise<string[]>;
      listMidiDevices: () => Promise<string[]>;
      selectMidiDevice: (name: string) => Promise<boolean>;
      setMidiLearn: (payload: unknown) => Promise<void>;
      oscTest: () => Promise<void>;
      onState: (cb: (state: unknown) => void) => void;
      onDebug: (cb: (data: unknown) => void) => void;
      onTick: (cb: (data: unknown) => void) => void;
    };
  }
}

export {};
