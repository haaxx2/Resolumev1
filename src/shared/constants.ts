import type { ChaseSettings, Panel, TransportState } from './types';

export const APP_NAME = 'Resolume V1 Chaser';

export const DEFAULT_OSC_HOST = '127.0.0.1';
export const DEFAULT_OSC_PORT = 9000;

export const DEFAULT_CHASE_SETTINGS: ChaseSettings = {
  mode: 'left-to-right',
  running: false,
  paused: false,
  speedMs: 250,
  bpm: 120,
  useBpmSync: false,
  stepSize: 1,
  loop: true,
  direction: 'forward',
  selectedPanels: [],
  customOrder: [],
  retriggerMode: 'replace',
  wrapMode: 'wrap'
};

export const DEFAULT_TRANSPORT_STATE: TransportState = {
  running: false,
  paused: false,
  currentStep: 0,
  bpm: 120,
  speedMs: 250
};

export const DEFAULT_PANELS: Panel[] = Array.from({ length: 8 }, (_, i) => ({
  id: `panel-${i + 1}`,
  name: `Panel ${i + 1}`,
  index: i,
  group: 'A',
  color: '#00bcd4',
  enabled: true,
  active: false,
  x: i % 4,
  y: Math.floor(i / 4)
}));

export const IPC_CHANNELS = {
  GET_APP_STATE: 'app:get-state',
  UPDATE_SETTINGS: 'app:update-settings',
  UPDATE_CHASE: 'chase:update-settings',
  UPDATE_PANELS: 'panels:update',
  TRANSPORT_START: 'transport:start',
  TRANSPORT_STOP: 'transport:stop',
  TRANSPORT_PAUSE: 'transport:pause',
  TRANSPORT_RESUME: 'transport:resume',
  TRANSPORT_RESET: 'transport:reset',
  TRANSPORT_TAP: 'transport:tap',
  TRANSPORT_STEP: 'transport:manual-step',
  PRESET_SAVE_AS: 'preset:save-as',
  PRESET_LOAD: 'preset:load',
  PRESET_DELETE: 'preset:delete',
  PRESET_LIST: 'preset:list',
  MIDI_LIST_DEVICES: 'midi:list-devices',
  MIDI_SELECT_DEVICE: 'midi:select-device',
  MIDI_SET_LEARN: 'midi:set-learn',
  OSC_TEST: 'osc:test',
  EVENT_APP_STATE: 'event:app-state',
  EVENT_DEBUG: 'event:debug',
  EVENT_TICK: 'event:tick'
} as const;
