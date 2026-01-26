import { EventEmitter } from 'node:events';
import { useEffect, useReducer } from 'react';

type Rythm = {
  tick?: number;
  intervalId?: NodeJS.Timeout;
} & EventEmitter;

const rythms = new Map<number, Rythm>();

function addRythmListener(interval: number, listener: () => void) {
  if (!rythms.has(interval)) {
    const newRythm: Rythm = new EventEmitter();
    newRythm.setMaxListeners(100);
    newRythm.tick = 0;
    newRythm.intervalId = setInterval(() => {
      newRythm.tick! += 1;
      newRythm.emit('tick');
    }, interval);
    rythms.set(interval, newRythm);
  }

  const rythm = rythms.get(interval);
  rythm!.on('tick', listener);
}

function removeRythmListener(interval: number, listener: () => void) {
  const rythm = rythms.get(interval);
  rythm!.off('tick', listener);

  const noListeners = rythm!.rawListeners('tick').length === 0;
  if (noListeners) {
    clearInterval(rythm!.intervalId);
    rythms.delete(interval);
  }
}

export function useRythm(interval: number, { active = true } = {}) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (!active) {
      return;
    }

    let isMounted = true;
    const listener = () => isMounted && forceUpdate();
    addRythmListener(interval, listener);

    return () => {
      isMounted = false;
      removeRythmListener(interval, listener);
    };
  }, [active]);

  return rythms.get(interval)?.tick ?? 0;
}
