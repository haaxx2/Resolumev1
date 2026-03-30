import osc from 'osc';
import type { OscSettings } from '../../shared/types';

export class OscManager {
  private udpPort?: osc.UDPPort;
  private settings: OscSettings = { host: '127.0.0.1', port: 9000, enabled: true };

  public configure(settings: OscSettings): void {
    this.settings = settings;
    if (this.udpPort) {
      this.udpPort.close();
      this.udpPort = undefined;
    }
    this.udpPort = new osc.UDPPort({ metadata: true });
    this.udpPort.open();
  }

  public send(address: string, value: number | string): void {
    if (!this.settings.enabled) return;
    if (!this.udpPort) this.configure(this.settings);
    this.udpPort?.send({ address, args: [{ type: typeof value === 'number' ? 'f' : 's', value }] }, this.settings.host, this.settings.port);
  }
}
