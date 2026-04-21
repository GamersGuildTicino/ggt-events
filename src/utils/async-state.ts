//------------------------------------------------------------------------------
// Async State Initial
//------------------------------------------------------------------------------

export type AsyncStateInitial = {
  status: "initial";
  isLoading: false;
  isSuccess: false;
  hasError: false;
};

//------------------------------------------------------------------------------
// Async State Loading
//------------------------------------------------------------------------------

export type AsyncStateLoading = {
  status: "loading";
  isLoading: true;
  isSuccess: false;
  hasError: false;
};

//------------------------------------------------------------------------------
// Async State Success
//------------------------------------------------------------------------------

export type AsyncStateSuccess<T> = {
  status: "success";
  isLoading: false;
  isSuccess: true;
  hasError: false;
  data: T;
};

//------------------------------------------------------------------------------
// Async State Failure
//------------------------------------------------------------------------------

export type AsyncStateFailure = {
  status: "failure";
  isLoading: false;
  isSuccess: false;
  hasError: true;
  error: string;
};

//------------------------------------------------------------------------------
// Async State
//------------------------------------------------------------------------------

export type AsyncState<T = undefined> =
  | AsyncStateInitial
  | AsyncStateLoading
  | AsyncStateSuccess<T>
  | AsyncStateFailure;

//------------------------------------------------------------------------------
// Async State Builders
//------------------------------------------------------------------------------

export function initial(): AsyncStateInitial {
  return {
    hasError: false,
    isLoading: false,
    isSuccess: false,
    status: "initial",
  };
}

export function loading(): AsyncStateLoading {
  return {
    hasError: false,
    isLoading: true,
    isSuccess: false,
    status: "loading",
  };
}

export function success<T>(data: T): AsyncStateSuccess<T> {
  return {
    data,
    hasError: false,
    isLoading: false,
    isSuccess: true,
    status: "success",
  };
}

export function failure(error: string): AsyncStateFailure {
  return {
    error,
    hasError: true,
    isLoading: false,
    isSuccess: false,
    status: "failure",
  };
}
