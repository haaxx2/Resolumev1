import midi from 'midi';
import type { MidiEvent } from '../../shared/types';

export class MidiManager {
  private input = new midi.Input();
  private activePort = -1;

  public listInputs(): string[] {
    const count = this.input.getPortCount();
    return Array.from({ length: count }, (_, i) => this.input.getPortName(i));
  }

  public selectInput(name: string, onEvent: (event: MidiEvent) => void): boolean {
    const index = this.listInputs().findIndex((inputName) => inputName === name);
    if (index < 0) return false;
    if (this.activePort >= 0) this.input.closePort();
    this.input.openPort(index);
    this.activePort = index;
    this.input.on('message', (_delta: number, message: number[]) => {
      const [status, data1, data2] = message;
      const channel = status & 0x0f;
      const kind = status & 0xf0;
      const type = kind === 0x90 ? 'noteon' : kind === 0x80 ? 'noteoff' : 'cc';
      onEvent({
        type,
        channel,
        data1: data1 ?? 0,
        data2: data2 ?? 0,
        raw: message,
        timestamp: Date.now()
      });
    });
    return true;
  }
}
