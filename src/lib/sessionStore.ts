import { useSyncExternalStore } from 'react';
// Session-only presentation data. Not authentication or backend persistence.
export function sessionStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  const read = () => value;
  const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
  const set = (next: T | ((current: T) => T)) => { value = typeof next === 'function' ? (next as (current: T) => T)(value) : next; listeners.forEach(fn => fn()); };
  return { read, set, useValue: () => useSyncExternalStore(subscribe, read, read) };
}
