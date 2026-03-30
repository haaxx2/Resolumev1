export class TransportClock {
  private interval?: NodeJS.Timeout;
  private onTick?: () => void;
  private speedMs = 250;

  public configure(speedMs: number, onTick: () => void): void {
    this.speedMs = speedMs;
    this.onTick = onTick;
  }

  public updateSpeed(speedMs: number): void {
    this.speedMs = speedMs;
    if (this.interval && this.onTick) {
      this.stop();
      this.start();
    }
  }

  public start(): void {
    if (!this.onTick) return;
    this.stop();
    this.interval = setInterval(() => this.onTick?.(), this.speedMs);
  }

  public stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }
}
