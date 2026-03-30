import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export const IOSettingsPanel = (): JSX.Element => {
  const settings = useAppStore((s) => s.settings);
  const midiInputs = useAppStore((s) => s.midiInputs);
  const setSettings = useAppStore((s) => s.setSettings);
  const listMidi = useAppStore((s) => s.listMidi);
  const selectMidi = useAppStore((s) => s.selectMidi);
  const setMidiLearn = useAppStore((s) => s.setMidiLearn);
  const oscTest = useAppStore((s) => s.oscTest);

  useEffect(() => {
    void listMidi();
  }, [listMidi]);

  return (
    <section className="panel-block">
      <h2>MIDI / OSC</h2>
      <div className="row">
        <label>
          MIDI Input
          <select onChange={(e) => void selectMidi(e.target.value)}>
            <option value="">-- select --</option>
            {midiInputs.map((input) => <option key={input} value={input}>{input}</option>)}
          </select>
        </label>
        <button onClick={() => void setMidiLearn({ enabled: true, targetCommand: 'start' })}>MIDI Learn Start</button>
      </div>
      <div className="row">
        <label>
          OSC Host
          <input value={settings.osc.host} onChange={(e) => void setSettings({ osc: { ...settings.osc, host: e.target.value } })} />
        </label>
        <label>
          OSC Port
          <input type="number" value={settings.osc.port} onChange={(e) => void setSettings({ osc: { ...settings.osc, port: Number(e.target.value) } })} />
        </label>
        <button onClick={() => void oscTest()}>OSC Test</button>
      </div>
    </section>
  );
};
