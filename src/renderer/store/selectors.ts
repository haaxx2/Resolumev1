import { useAppStore } from './useAppStore';

export const useActivePanels = () => useAppStore((s) => s.panels.filter((p) => p.active));
export const useTransportStatus = () => useAppStore((s) => ({
  running: s.transportState.running,
  paused: s.transportState.paused,
  step: s.transportState.currentStep
}));
