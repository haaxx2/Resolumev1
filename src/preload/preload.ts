import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';

const api = {
  getState: () => ipcRenderer.invoke(IPC_CHANNELS.GET_APP_STATE),
  updateSettings: (payload: unknown) => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_SETTINGS, payload),
  updateChase: (payload: unknown) => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_CHASE, payload),
  updatePanels: (payload: unknown) => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_PANELS, payload),
  transportStart: () => ipcRenderer.invoke(IPC_CHANNELS.TRANSPORT_START),
  transportStop: () => ipcRenderer.invoke(IPC_CHANNELS.TRANSPORT_STOP),
  transportPause: () => ipcRenderer.invoke(IPC_CHANNELS.TRANSPORT_PAUSE),
  transportResume: () => ipcRenderer.invoke(IPC_CHANNELS.TRANSPORT_RESUME),
  transportReset: () => ipcRenderer.invoke(IPC_CHANNELS.TRANSPORT_RESET),
  transportTap: () => ipcRenderer.invoke(IPC_CHANNELS.TRANSPORT_TAP),
  manualStep: (dir: 'next' | 'prev') => ipcRenderer.invoke(IPC_CHANNELS.TRANSPORT_STEP, dir),
  savePresetAs: (preset: unknown) => ipcRenderer.invoke(IPC_CHANNELS.PRESET_SAVE_AS, preset),
  loadPreset: () => ipcRenderer.invoke(IPC_CHANNELS.PRESET_LOAD),
  deletePreset: (name: string) => ipcRenderer.invoke(IPC_CHANNELS.PRESET_DELETE, name),
  listPresets: () => ipcRenderer.invoke(IPC_CHANNELS.PRESET_LIST),
  listMidiDevices: () => ipcRenderer.invoke(IPC_CHANNELS.MIDI_LIST_DEVICES),
  selectMidiDevice: (name: string) => ipcRenderer.invoke(IPC_CHANNELS.MIDI_SELECT_DEVICE, name),
  setMidiLearn: (payload: unknown) => ipcRenderer.invoke(IPC_CHANNELS.MIDI_SET_LEARN, payload),
  oscTest: () => ipcRenderer.invoke(IPC_CHANNELS.OSC_TEST),
  onState: (cb: (state: unknown) => void) => ipcRenderer.on(IPC_CHANNELS.EVENT_APP_STATE, (_, data) => cb(data)),
  onDebug: (cb: (data: unknown) => void) => ipcRenderer.on(IPC_CHANNELS.EVENT_DEBUG, (_, data) => cb(data)),
  onTick: (cb: (data: unknown) => void) => ipcRenderer.on(IPC_CHANNELS.EVENT_TICK, (_, data) => cb(data))
};

contextBridge.exposeInMainWorld('chaserApi', api);
