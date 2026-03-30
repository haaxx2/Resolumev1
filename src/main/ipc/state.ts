import { BrowserWindow, ipcMain } from 'electron';
import { DEFAULT_CHASE_SETTINGS, DEFAULT_OSC_HOST, DEFAULT_OSC_PORT, DEFAULT_PANELS, DEFAULT_TRANSPORT_STATE, IPC_CHANNELS } from '../../shared/constants';
import type { AppSettings, DebugMessage, EngineTickResult, MidiEvent, MidiLearnState, MidiMapping, Panel, PanelGroup } from '../../shared/types';
import { ChaseEngine } from '../services/ChaseEngine';
import { MidiManager } from '../services/MidiManager';
import { OscManager } from '../services/OscManager';
import { PresetManager } from '../services/PresetManager';
import { TransportClock } from '../services/TransportClock';

interface AppRuntimeState {
  panels: Panel[];
  groups: PanelGroup[];
  chase: typeof DEFAULT_CHASE_SETTINGS;
  transport: typeof DEFAULT_TRANSPORT_STATE;
  midiMappings: MidiMapping[];
  settings: AppSettings;
  presets: string[];
  midiInputs: string[];
  midiLearn: MidiLearnState;
}

export const registerIpcState = (mainWindow: BrowserWindow): void => {
  const chaseEngine = new ChaseEngine();
  const clock = new TransportClock();
  const midi = new MidiManager();
  const osc = new OscManager();
  const presets = new PresetManager();

  const state: AppRuntimeState = {
    panels: DEFAULT_PANELS,
    groups: [{ id: 'group-a', name: 'A', color: '#00bcd4' }],
    chase: { ...DEFAULT_CHASE_SETTINGS },
    transport: { ...DEFAULT_TRANSPORT_STATE },
    midiMappings: [],
    settings: { osc: { host: DEFAULT_OSC_HOST, port: DEFAULT_OSC_PORT, enabled: true } },
    presets: [],
    midiInputs: [],
    midiLearn: { enabled: false }
  };

  const emitDebug = (message: DebugMessage): void => {
    mainWindow.webContents.send(IPC_CHANNELS.EVENT_DEBUG, message);
  };
  const emitState = (): void => {
    mainWindow.webContents.send(IPC_CHANNELS.EVENT_APP_STATE, state);
  };
  const emitTick = (tick: EngineTickResult): void => {
    mainWindow.webContents.send(IPC_CHANNELS.EVENT_TICK, tick);
  };

  const applyTick = (): void => {
    state.transport.currentStep += 1;
    const tick = chaseEngine.tick(state.transport.currentStep, state.panels, state.chase);
    const active = new Set(tick.activePanelIds);
    state.panels = state.panels.map((panel) => ({ ...panel, active: active.has(panel.id) }));
    tick.activePanelIds.forEach((id) => osc.send(`/panel/${id}/active`, 1));
    tick.deactivatedPanelIds.forEach((id) => osc.send(`/panel/${id}/inactive`, 0));
    emitTick(tick);
    emitState();
  };

  clock.configure(state.transport.speedMs, applyTick);
  osc.configure(state.settings.osc);
  state.midiInputs = midi.listInputs();
  presets.listPresets().then((list) => {
    state.presets = list;
    emitState();
  });

  ipcMain.handle(IPC_CHANNELS.GET_APP_STATE, async () => state);
  ipcMain.handle(IPC_CHANNELS.UPDATE_SETTINGS, async (_, next) => {
    state.settings = { ...state.settings, ...next };
    osc.configure(state.settings.osc);
    emitState();
    return state;
  });
  ipcMain.handle(IPC_CHANNELS.UPDATE_CHASE, async (_, next) => {
    state.chase = { ...state.chase, ...next };
    const speed = state.chase.useBpmSync ? Math.round(60000 / state.chase.bpm) : state.chase.speedMs;
    state.transport.speedMs = speed;
    clock.updateSpeed(speed);
    emitState();
    return state;
  });
  ipcMain.handle(IPC_CHANNELS.UPDATE_PANELS, async (_, panels: Panel[]) => {
    state.panels = panels;
    emitState();
    return state;
  });

  ipcMain.handle(IPC_CHANNELS.TRANSPORT_START, async () => {
    state.transport.running = true;
    state.transport.paused = false;
    state.chase.running = true;
    state.chase.paused = false;
    clock.start();
    osc.send('/chaser/start', 1);
    emitState();
  });
  ipcMain.handle(IPC_CHANNELS.TRANSPORT_STOP, async () => {
    clock.stop();
    state.transport.running = false;
    state.transport.paused = false;
    state.chase.running = false;
    state.chase.paused = false;
    state.transport.currentStep = 0;
    chaseEngine.reset();
    state.panels = state.panels.map((panel) => ({ ...panel, active: false }));
    osc.send('/chaser/stop', 0);
    emitState();
  });
  ipcMain.handle(IPC_CHANNELS.TRANSPORT_PAUSE, async () => {
    clock.stop();
    state.transport.paused = true;
    state.chase.paused = true;
    emitState();
  });
  ipcMain.handle(IPC_CHANNELS.TRANSPORT_RESUME, async () => {
    if (state.transport.running) {
      state.transport.paused = false;
      state.chase.paused = false;
      clock.start();
      emitState();
    }
  });
  ipcMain.handle(IPC_CHANNELS.TRANSPORT_RESET, async () => {
    state.transport.currentStep = 0;
    chaseEngine.reset();
    state.panels = state.panels.map((panel) => ({ ...panel, active: false }));
    emitState();
  });
  ipcMain.handle(IPC_CHANNELS.TRANSPORT_TAP, async () => {
    const now = Date.now();
    if (state.transport.lastTapAt) {
      const delta = now - state.transport.lastTapAt;
      const bpm = Math.max(30, Math.min(300, Math.round(60000 / delta)));
      state.chase.bpm = bpm;
      state.transport.bpm = bpm;
      if (state.chase.useBpmSync) {
        state.transport.speedMs = Math.round(60000 / bpm);
        clock.updateSpeed(state.transport.speedMs);
      }
    }
    state.transport.lastTapAt = now;
    emitState();
  });
  ipcMain.handle(IPC_CHANNELS.TRANSPORT_STEP, async (_, direction: 'next' | 'prev') => {
    state.transport.currentStep += direction === 'next' ? 1 : -1;
    if (state.transport.currentStep < 0) state.transport.currentStep = 0;
    applyTick();
  });

  ipcMain.handle(IPC_CHANNELS.PRESET_SAVE_AS, async (_, preset) => {
    const path = await presets.saveAs(preset);
    state.presets = await presets.listPresets();
    emitState();
    return path;
  });
  ipcMain.handle(IPC_CHANNELS.PRESET_LOAD, async () => {
    const preset = await presets.loadWithDialog();
    if (!preset) return null;
    state.panels = preset.panels;
    state.groups = preset.groups;
    state.chase = preset.chase;
    state.transport = preset.transport;
    state.midiMappings = preset.midiMappings;
    state.settings = preset.settings;
    osc.configure(state.settings.osc);
    osc.send('/preset/load', preset.name);
    emitState();
    return preset;
  });
  ipcMain.handle(IPC_CHANNELS.PRESET_DELETE, async (_, presetName: string) => {
    await presets.deletePreset(presetName);
    state.presets = await presets.listPresets();
    emitState();
  });
  ipcMain.handle(IPC_CHANNELS.PRESET_LIST, async () => {
    state.presets = await presets.listPresets();
    emitState();
    return state.presets;
  });

  ipcMain.handle(IPC_CHANNELS.MIDI_LIST_DEVICES, async () => {
    state.midiInputs = midi.listInputs();
    emitState();
    return state.midiInputs;
  });
  ipcMain.handle(IPC_CHANNELS.MIDI_SELECT_DEVICE, async (_, name: string) => {
    const selected = midi.selectInput(name, (event: MidiEvent) => {
      emitDebug({ timestamp: Date.now(), type: 'midi', message: `${event.type} ch${event.channel} ${event.data1}/${event.data2}` });
      if (state.midiLearn.enabled && state.midiLearn.targetCommand) {
        state.midiMappings.push({
          id: `map-${Date.now()}`,
          command: state.midiLearn.targetCommand,
          trigger: { type: event.type, channel: event.channel, data1: event.data1 },
          targetId: state.midiLearn.targetId
        });
        state.midiLearn = { enabled: false };
        emitState();
        return;
      }
      const hit = state.midiMappings.find((mapping) => mapping.trigger.type === event.type && mapping.trigger.channel === event.channel && mapping.trigger.data1 === event.data1);
      if (!hit) return;
      if (hit.command === 'start') void ipcMain.emit(IPC_CHANNELS.TRANSPORT_START);
      if (hit.command === 'stop') void ipcMain.emit(IPC_CHANNELS.TRANSPORT_STOP);
      if (hit.command === 'pause') void ipcMain.emit(IPC_CHANNELS.TRANSPORT_PAUSE);
    });
    if (selected) {
      state.settings.midiInputName = name;
      emitState();
    }
    return selected;
  });
  ipcMain.handle(IPC_CHANNELS.MIDI_SET_LEARN, async (_, learnState) => {
    state.midiLearn = learnState;
    emitState();
  });

  ipcMain.handle(IPC_CHANNELS.OSC_TEST, async () => {
    osc.send('/chaser/test', 1);
    emitDebug({ timestamp: Date.now(), type: 'osc', message: 'OSC test sent /chaser/test 1' });
  });
};
