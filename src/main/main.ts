import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { registerIpc } from './ipc';

const createWindow = (): BrowserWindow => {
  const win = new BrowserWindow({
    width: 1600,
    height: 960,
    backgroundColor: '#111318',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  registerIpc(win);
  return win;
};

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
