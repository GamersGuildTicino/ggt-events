//------------------------------------------------------------------------------
// Async State
//------------------------------------------------------------------------------

export type AsyncState<T = undefined> =
  | { status: "initial"; isLoading: false; hasError: false }
  | { status: "loading"; isLoading: true; hasError: false }
  | { status: "success"; isLoading: false; hasError: false; data: T }
  | { status: "failure"; isLoading: false; hasError: true; error: string };

//------------------------------------------------------------------------------
// Async State Builders
//------------------------------------------------------------------------------

export function initial<T>(): AsyncState<T> {
  return { hasError: false, isLoading: false, status: "initial" };
}

export function loading<T>(): AsyncState<T> {
  return { hasError: false, isLoading: true, status: "loading" };
}

export function success<T>(data: T): AsyncState<T> {
  return { data, hasError: false, isLoading: false, status: "success" };
}

export function failure<T>(error: string): AsyncState<T> {
  return { error, hasError: true, isLoading: false, status: "failure" };
}
