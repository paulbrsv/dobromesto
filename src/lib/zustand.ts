import { useSyncExternalStore } from 'react';

type PartialState<T> = Partial<T> | ((state: T) => Partial<T>);

type StateCreator<T> = (
  setState: (partial: PartialState<T>, replace?: boolean) => void,
  getState: () => T
) => T;

type Subscriber = () => void;

type UseStore<T> = {
  (): T;
  <U>(selector: (state: T) => U, equalityFn?: (a: U, b: U) => boolean): U;
  getState: () => T;
  setState: (partial: PartialState<T>, replace?: boolean) => void;
  subscribe: (listener: Subscriber) => () => void;
};

export function create<T>(initializer: StateCreator<T>): UseStore<T> {
  let state: T;
  const listeners = new Set<Subscriber>();

  const setState = (partial: PartialState<T>, replace = false) => {
    const nextPartial = typeof partial === 'function' ? (partial as (state: T) => Partial<T>)(state) : partial;
    state = replace ? (nextPartial as T) : { ...state, ...nextPartial };
    listeners.forEach((listener) => listener());
  };

  const getState = () => state;

  const subscribe = (listener: Subscriber) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  state = initializer(setState, getState);

  function useStore<U = T>(
    selector?: (state: T) => U,
    equalityFn: (a: U, b: U) => boolean = Object.is
  ): U {
    const getSelectedState = () => {
      const select = selector ?? ((state: T) => state as unknown as U);
      return select(state);
    };

    const subscribeWithSelector = (listener: Subscriber) => {
      let previous = getSelectedState();
      const wrapped = () => {
        const nextState = getSelectedState();
        if (!equalityFn(previous, nextState)) {
          previous = nextState;
          listener();
        }
      };
      listeners.add(wrapped);
      return () => listeners.delete(wrapped);
    };

    return useSyncExternalStore(subscribeWithSelector, getSelectedState, getSelectedState);
  }

  (useStore as UseStore<T>).getState = getState;
  (useStore as UseStore<T>).setState = setState;
  (useStore as UseStore<T>).subscribe = subscribe;

  return useStore as UseStore<T>;
}
