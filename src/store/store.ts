import { useLayoutEffect, useState } from "react";
import { createObservable } from "~/utils/observable";
import {
  type StateSetter,
  type StateUpdate,
  isStateUpdater,
} from "~/utils/state";

//------------------------------------------------------------------------------
// Store
//------------------------------------------------------------------------------

export type Store<T> = {
  get: () => T;
  set: StateSetter<T>;

  use: () => [T, StateSetter<T>];
  useSetValue: () => StateSetter<T>;
  useValue: () => T;

  subscribe: (callback: (value: T) => void) => void;
  unsubscribe: (callback: (value: T) => void) => void;
};

//------------------------------------------------------------------------------
// Create Store
//------------------------------------------------------------------------------

export function createStore<T>(
  id: string,
  {
    initCache,
    onCacheUpdate,
  }: { initCache: () => T; onCacheUpdate: (value: T) => void },
): Store<T> {
  const { notify, subscribe, unsubscribe } = createObservable<T>(id);

  let cache = initCache();

  function get(): T {
    return cache;
  }

  function set(update: StateUpdate<T>): T {
    cache = isStateUpdater(update) ? update(cache) : update;
    onCacheUpdate(cache);
    notify(cache);
    return cache;
  }

  function useValue(): T {
    const [value, setValue] = useState(get);
    useLayoutEffect(() => subscribe(setValue), []);
    return value;
  }

  function useSetValue(): StateSetter<T> {
    return set;
  }

  function use(): [T, StateSetter<T>] {
    const value = useValue();
    const setValue = useSetValue();
    return [value, setValue];
  }

  return {
    get,
    set,

    use,
    useSetValue,
    useValue,

    subscribe,
    unsubscribe,
  };
}
