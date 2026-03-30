import type { ChaseSettings, EngineTickResult, Panel } from '../../shared/types';

const mulberry32 = (seed: number) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

export class ChaseEngine {
  private previousActive = new Set<string>();

  public tick(step: number, panels: Panel[], settings: ChaseSettings): EngineTickResult {
    const targetPanels = this.resolveTargets(panels, settings);
    if (targetPanels.length === 0) {
      return { step, activePanelIds: [], deactivatedPanelIds: Array.from(this.previousActive) };
    }

    const sequence = this.buildSequence(targetPanels, settings);
    if (sequence.length === 0) {
      return { step, activePanelIds: [], deactivatedPanelIds: Array.from(this.previousActive) };
    }

    const groupIndex = this.normalizeIndex(step, sequence.length, settings);
    const activePanelIds = this.collectStepPanels(sequence, groupIndex, settings.stepSize);
    const deactivatedPanelIds = settings.retriggerMode === 'hold'
      ? []
      : Array.from(this.previousActive).filter((id) => !activePanelIds.includes(id));

    this.previousActive = settings.retriggerMode === 'hold'
      ? new Set([...this.previousActive, ...activePanelIds])
      : new Set(activePanelIds);

    return { step, activePanelIds, deactivatedPanelIds };
  }

  public reset(): void {
    this.previousActive.clear();
  }

  private resolveTargets(panels: Panel[], settings: ChaseSettings): Panel[] {
    const enabledPanels = panels.filter((panel) => panel.enabled).sort((a, b) => a.index - b.index);
    if (settings.selectedPanels.length > 0) {
      const selected = new Set(settings.selectedPanels);
      return enabledPanels.filter((panel) => selected.has(panel.id));
    }
    if (settings.targetGroup) {
      return enabledPanels.filter((panel) => panel.group === settings.targetGroup);
    }
    return enabledPanels;
  }

  private buildSequence(panels: Panel[], settings: ChaseSettings): string[][] {
    const ids = panels.map((panel) => panel.id);
    switch (settings.mode) {
      case 'left-to-right':
        return ids.map((id) => [id]);
      case 'right-to-left':
        return [...ids].reverse().map((id) => [id]);
      case 'ping-pong': {
        if (ids.length <= 1) return ids.map((id) => [id]);
        const forward = ids.map((id) => [id]);
        const backward = ids.slice(1, -1).reverse().map((id) => [id]);
        return [...forward, ...backward];
      }
      case 'random': {
        const rnd = settings.randomSeed !== undefined ? mulberry32(settings.randomSeed) : Math.random;
        const seq = [...ids];
        for (let i = seq.length - 1; i > 0; i -= 1) {
          const j = Math.floor(rnd() * (i + 1));
          [seq[i], seq[j]] = [seq[j], seq[i]];
        }
        return seq.map((id) => [id]);
      }
      case 'center-out': {
        const result: string[][] = [];
        const mid = Math.floor((ids.length - 1) / 2);
        for (let offset = 0; offset <= mid; offset += 1) {
          const left = mid - offset;
          const right = ids.length % 2 === 0 ? mid + 1 + offset : mid + offset;
          const stepIds = [ids[left], ids[right]].filter(Boolean);
          result.push([...new Set(stepIds)]);
        }
        return result;
      }
      case 'center-in':
        return this.buildSequence(panels, { ...settings, mode: 'center-out' }).reverse();
      case 'odd-even': {
        const odd = ids.filter((_, i) => i % 2 === 0);
        const even = ids.filter((_, i) => i % 2 === 1);
        return [odd, even].filter((stepIds) => stepIds.length > 0);
      }
      case 'custom-order': {
        const allowed = new Set(ids);
        const custom = settings.customOrder.filter((id) => allowed.has(id));
        return custom.length > 0 ? custom.map((id) => [id]) : ids.map((id) => [id]);
      }
      default:
        return ids.map((id) => [id]);
    }
  }

  private normalizeIndex(step: number, length: number, settings: ChaseSettings): number {
    if (length === 0) return 0;
    const directionStep = settings.direction === 'reverse' ? -step : step;
    if (settings.wrapMode === 'stop-at-end') {
      return Math.max(0, Math.min(length - 1, directionStep));
    }
    return ((directionStep % length) + length) % length;
  }

  private collectStepPanels(sequence: string[][], index: number, stepSize: number): string[] {
    const active = new Set<string>();
    for (let i = 0; i < stepSize; i += 1) {
      const seqIndex = (index + i) % sequence.length;
      sequence[seqIndex].forEach((id) => active.add(id));
    }
    return Array.from(active);
  }
}
