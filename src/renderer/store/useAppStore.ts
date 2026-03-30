import { create } from 'zustand';
import { DEFAULT_CHASE_SETTINGS, DEFAULT_PANELS, DEFAULT_TRANSPORT_STATE } from '../../shared/constants';
import type { AppSettings, ChaseSettings, DebugMessage, MidiLearnState, MidiMapping, Panel, PanelGroup, PresetFile, TransportState } from '../../shared/types';

interface AppStore {
  panels: Panel[];
  groups: PanelGroup[];
  chase: ChaseSettings;
  transportState: TransportState;
  midiMappings: MidiMapping[];
  settings: AppSettings;
  presets: string[];
  midiInputs: string[];
  debug: DebugMessage[];
  midiLearn: MidiLearnState;
  setFromMain: (payload: any) => void;
  setChase: (patch: Partial<ChaseSettings>) => Promise<void>;
  setPanels: (panels: Panel[]) => Promise<void>;
  setSettings: (patch: Partial<AppSettings>) => Promise<void>;
  transport: {
    start: () => Promise<void>;
    stop: () => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    reset: () => Promise<void>;
    tap: () => Promise<void>;
    step: (direction: 'next' | 'prev') => Promise<void>;
  };
  savePresetAs: () => Promise<void>;
  loadPreset: () => Promise<void>;
  deletePreset: (name: string) => Promise<void>;
  listPresets: () => Promise<void>;
  listMidi: () => Promise<void>;
  selectMidi: (name: string) => Promise<void>;
  setMidiLearn: (learnState: MidiLearnState) => Promise<void>;
  oscTest: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  osc: { host: '127.0.0.1', port: 9000, enabled: true }
};

export const useAppStore = create<AppStore>((set, get) => ({
  panels: DEFAULT_PANELS,
  groups: [{ id: 'group-a', name: 'A', color: '#00bcd4' }],
  chase: DEFAULT_CHASE_SETTINGS,
  transportState: DEFAULT_TRANSPORT_STATE,
  midiMappings: [],
  settings: defaultSettings,
  presets: [],
  midiInputs: [],
  debug: [],
  midiLearn: { enabled: false },
  setFromMain: (payload) => set({ ...payload, transportState: payload.transport ?? payload.transportState }),
  setChase: async (patch) => {
    await window.chaserApi.updateChase(patch);
  },
  setPanels: async (panels) => {
    await window.chaserApi.updatePanels(panels);
  },
  setSettings: async (patch) => {
    await window.chaserApi.updateSettings(patch);
  },
  transport: {
    start: async () => window.chaserApi.transportStart(),
    stop: async () => window.chaserApi.transportStop(),
    pause: async () => window.chaserApi.transportPause(),
    resume: async () => window.chaserApi.transportResume(),
    reset: async () => window.chaserApi.transportReset(),
    tap: async () => window.chaserApi.transportTap(),
    step: async (direction) => window.chaserApi.manualStep(direction)
  },
  savePresetAs: async () => {
    const state = get();
    const preset: PresetFile = {
      version: 1,
      name: `preset-${Date.now()}`,
      panels: state.panels,
      groups: state.groups,
      chase: state.chase,
      transport: state.transportState,
      midiMappings: state.midiMappings,
      settings: state.settings
    };
    await window.chaserApi.savePresetAs(preset);
    await get().listPresets();
  },
  loadPreset: async () => {
    await window.chaserApi.loadPreset();
  },
  deletePreset: async (name) => {
    await window.chaserApi.deletePreset(name);
    await get().listPresets();
  },
  listPresets: async () => {
    const presets = await window.chaserApi.listPresets();
    set({ presets });
  },
  listMidi: async () => {
    const midiInputs = await window.chaserApi.listMidiDevices();
    set({ midiInputs });
  },
  selectMidi: async (name) => {
    await window.chaserApi.selectMidiDevice(name);
  },
  setMidiLearn: async (learnState) => {
    set({ midiLearn: learnState });
    await window.chaserApi.setMidiLearn(learnState);
  },
  oscTest: async () => {
    await window.chaserApi.oscTest();
  }
}));
