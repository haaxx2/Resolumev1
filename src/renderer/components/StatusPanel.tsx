import { useAppStore } from '../store/useAppStore';

export const StatusPanel = (): JSX.Element => {
  const debug = useAppStore((s) => s.debug);
  const step = useAppStore((s) => s.transportState.currentStep);

  return (
    <section className="panel-block status-panel">
      <h2>Status / Debug</h2>
      <div>Current Step: {step}</div>
      <ul>
        {debug.slice(0, 8).map((item) => (
          <li key={`${item.timestamp}-${item.message}`}>[{item.type}] {item.message}</li>
        ))}
      </ul>
    </section>
  );
};
