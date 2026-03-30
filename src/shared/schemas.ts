import { z } from 'zod';

export const panelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  index: z.number().int().nonnegative(),
  group: z.string().min(1),
  color: z.string().min(1),
  enabled: z.boolean(),
  active: z.boolean(),
  x: z.number().optional(),
  y: z.number().optional()
});

export const panelGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1)
});

export const chaseSchema = z.object({
  mode: z.enum([
    'left-to-right',
    'right-to-left',
    'ping-pong',
    'random',
    'center-out',
    'center-in',
    'odd-even',
    'custom-order'
  ]),
  running: z.boolean(),
  paused: z.boolean(),
  speedMs: z.number().int().positive(),
  bpm: z.number().positive(),
  useBpmSync: z.boolean(),
  stepSize: z.number().int().positive(),
  loop: z.boolean(),
  direction: z.enum(['forward', 'reverse']),
  selectedPanels: z.array(z.string()),
  targetGroup: z.string().optional(),
  customOrder: z.array(z.string()),
  retriggerMode: z.enum(['replace', 'hold']),
  wrapMode: z.enum(['wrap', 'stop-at-end']),
  randomSeed: z.number().optional()
});

export const transportSchema = z.object({
  running: z.boolean(),
  paused: z.boolean(),
  currentStep: z.number().int().nonnegative(),
  bpm: z.number().positive(),
  speedMs: z.number().int().positive(),
  lastTapAt: z.number().optional()
});

export const midiMappingSchema = z.object({
  id: z.string().min(1),
  command: z.enum([
    'start',
    'stop',
    'pause',
    'next-step',
    'prev-step',
    'speed-up',
    'speed-down',
    'mode-next',
    'preset-load',
    'panel-trigger'
  ]),
  trigger: z.object({
    type: z.enum(['noteon', 'noteoff', 'cc']),
    channel: z.number().min(0).max(15),
    data1: z.number().min(0).max(127)
  }),
  value: z.number().optional(),
  targetId: z.string().optional()
});

export const oscSettingsSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  enabled: z.boolean()
});

export const appSettingsSchema = z.object({
  midiInputName: z.string().optional(),
  osc: oscSettingsSchema
});

export const presetFileSchema = z.object({
  version: z.literal(1),
  name: z.string().min(1),
  panels: z.array(panelSchema),
  groups: z.array(panelGroupSchema),
  chase: chaseSchema,
  transport: transportSchema,
  midiMappings: z.array(midiMappingSchema),
  settings: appSettingsSchema
});

export type PresetFileInput = z.infer<typeof presetFileSchema>;
