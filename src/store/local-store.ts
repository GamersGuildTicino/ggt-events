import { type Store, createStore } from "./store";

//------------------------------------------------------------------------------
// Create Local Store
//------------------------------------------------------------------------------

export function createLocalStore<T>(
  id: string,
  defaultValue: T,
  parse: (maybeT: unknown) => T,
): Store<T> {
  return createStore(id, {
    initCache: () => {
      try {
        const stringOrNull = localStorage.getItem(id);
        return stringOrNull === null ? defaultValue : (
            parse(JSON.parse(stringOrNull))
          );
      } catch {
        localStorage.removeItem(id);
        return defaultValue;
      }
    },
    onCacheUpdate: (cache) => {
      localStorage.setItem(id, JSON.stringify(cache));
    },
  });
}
