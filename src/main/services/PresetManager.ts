import { app, dialog } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { presetFileSchema } from '../../shared/schemas';
import type { PresetFile } from '../../shared/types';

export class PresetManager {
  public readonly presetDir: string;

  constructor() {
    this.presetDir = path.join(app.getPath('documents'), 'ResolumeV1Chaser', 'presets');
  }

  public async ensureDir(): Promise<void> {
    await fs.mkdir(this.presetDir, { recursive: true });
  }

  public async listPresets(): Promise<string[]> {
    await this.ensureDir();
    const entries = await fs.readdir(this.presetDir);
    return entries.filter((entry) => entry.endsWith('.json'));
  }

  public async saveAs(preset: PresetFile): Promise<string | null> {
    await this.ensureDir();
    const result = await dialog.showSaveDialog({
      title: 'Save Preset',
      defaultPath: path.join(this.presetDir, `${preset.name}.json`),
      filters: [{ name: 'Preset JSON', extensions: ['json'] }]
    });
    if (result.canceled || !result.filePath) return null;
    await fs.writeFile(result.filePath, JSON.stringify(preset, null, 2), 'utf8');
    return result.filePath;
  }

  public async loadWithDialog(): Promise<PresetFile | null> {
    await this.ensureDir();
    const result = await dialog.showOpenDialog({
      title: 'Load Preset',
      defaultPath: this.presetDir,
      filters: [{ name: 'Preset JSON', extensions: ['json'] }],
      properties: ['openFile']
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return this.loadFromPath(result.filePaths[0]);
  }

  public async loadFromPath(filePath: string): Promise<PresetFile | null> {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    const validated = presetFileSchema.safeParse(parsed);
    return validated.success ? validated.data : null;
  }

  public async deletePreset(name: string): Promise<void> {
    await fs.unlink(path.join(this.presetDir, name));
  }
}
