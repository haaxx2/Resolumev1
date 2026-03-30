import type { BrowserWindow } from 'electron';
import { registerIpcState } from './state';

export const registerIpc = (mainWindow: BrowserWindow): void => {
  registerIpcState(mainWindow);
};
