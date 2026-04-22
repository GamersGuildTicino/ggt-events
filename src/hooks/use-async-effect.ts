import { useEffect } from "react";

//------------------------------------------------------------------------------
// Use Async Effect
//------------------------------------------------------------------------------

export function useAsyncEffect(
  effect: (isActive: () => boolean) => Promise<void>,
  deps: React.DependencyList,
) {
  useEffect(() => {
    let active = true;
    void effect(() => active);
    return () => {
      active = false;
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
