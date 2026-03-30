import { useAppStore } from '../store/useAppStore';

export const TransportControls = (): JSX.Element => {
  const transport = useAppStore((s) => s.transport);
  const chase = useAppStore((s) => s.chase);
  const setChase = useAppStore((s) => s.setChase);

  return (
    <section className="panel-block">
      <h2>Transport</h2>
      <div className="row">
        <button onClick={() => void transport.start()}>Start</button>
        <button onClick={() => void transport.stop()}>Stop</button>
        <button onClick={() => void transport.pause()}>Pause</button>
        <button onClick={() => void transport.resume()}>Resume</button>
        <button onClick={() => void transport.reset()}>Reset</button>
        <button onClick={() => void transport.tap()}>Tap</button>
      </div>
      <div className="row">
        <label>
          BPM
          <input type="number" value={chase.bpm} onChange={(e) => void setChase({ bpm: Number(e.target.value) })} />
        </label>
        <label>
          Speed (ms)
          <input type="number" value={chase.speedMs} onChange={(e) => void setChase({ speedMs: Number(e.target.value) })} />
        </label>
        <label>
          BPM Sync
          <input type="checkbox" checked={chase.useBpmSync} onChange={(e) => void setChase({ useBpmSync: e.target.checked })} />
        </label>
      </div>
    </section>
  );
};
