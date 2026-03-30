export type UUID = string;

export type ChaseMode =
  | 'left-to-right'
  | 'right-to-left'
  | 'ping-pong'
  | 'random'
  | 'center-out'
  | 'center-in'
  | 'odd-even'
  | 'custom-order';

export type ChaseDirection = 'forward' | 'reverse';

export interface Panel {
  id: UUID;
  name: string;
  index: number;
  group: string;
  color: string;
  enabled: boolean;
  active: boolean;
  x?: number;
  y?: number;
}

export interface PanelGroup {
  id: UUID;
  name: string;
  color: string;
}

export interface ChaseSettings {
  mode: ChaseMode;
  running: boolean;
  paused: boolean;
  speedMs: number;
  bpm: number;
  useBpmSync: boolean;
  stepSize: number;
  loop: boolean;
  direction: ChaseDirection;
  selectedPanels: UUID[];
  targetGroup?: string;
  customOrder: UUID[];
  retriggerMode: 'replace' | 'hold';
  wrapMode: 'wrap' | 'stop-at-end';
  randomSeed?: number;
}

export interface TransportState {
  running: boolean;
  paused: boolean;
  currentStep: number;
  bpm: number;
  speedMs: number;
  lastTapAt?: number;
}

export type MidiMessageType = 'noteon' | 'noteoff' | 'cc';

export interface MidiEvent {
  type: MidiMessageType;
  channel: number;
  data1: number;
  data2: number;
  raw: number[];
  timestamp: number;
}

export interface MidiMapping {
  id: UUID;
  command:
    | 'start'
    | 'stop'
    | 'pause'
    | 'next-step'
    | 'prev-step'
    | 'speed-up'
    | 'speed-down'
    | 'mode-next'
    | 'preset-load'
    | 'panel-trigger';
  trigger: {
    type: MidiMessageType;
    channel: number;
    data1: number;
  };
  value?: number;
  targetId?: string;
}

export interface OscSettings {
  host: string;
  port: number;
  enabled: boolean;
}

export interface AppSettings {
  midiInputName?: string;
  osc: OscSettings;
}

export interface EngineTickResult {
  step: number;
  activePanelIds: UUID[];
  deactivatedPanelIds: UUID[];
}

export interface PresetFile {
  version: 1;
  name: string;
  panels: Panel[];
  groups: PanelGroup[];
  chase: ChaseSettings;
  transport: TransportState;
  midiMappings: MidiMapping[];
  settings: AppSettings;
}

export interface DebugMessage {
  timestamp: number;
  type: 'osc' | 'midi' | 'system' | 'error';
  message: string;
}

export interface MidiLearnState {
  enabled: boolean;
  targetCommand?: MidiMapping['command'];
  targetId?: string;
}
