import { type Store, createStore } from "./store";

//------------------------------------------------------------------------------
// Create Memory Store
//------------------------------------------------------------------------------

export function createMemoryStore<T>(id: string, defaultValue: T): Store<T> {
  return createStore(id, {
    initCache: () => defaultValue,
    onCacheUpdate: () => {},
  });
}
