import React, { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type QueryKey = readonly unknown[];

type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

type QueryState<TData> = {
  data?: TData;
  error?: Error;
  status: QueryStatus;
  updatedAt: number;
};

type QueryListener = () => void;

type QueryOptions<TData, TError> = {
  staleTime?: number;
  enabled?: boolean;
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
};

type UseQueryResult<TData, TError> = {
  data: TData | undefined;
  error: TError | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  status: QueryStatus;
  refetch: () => Promise<void>;
};

const hashKey = (key: QueryKey) => JSON.stringify(key);

class QueryClient {
  private cache = new Map<string, QueryState<any>>();
  private listeners = new Map<string, Set<QueryListener>>();

  getQueryState<TData>(key: QueryKey): QueryState<TData> | undefined {
    return this.cache.get(hashKey(key));
  }

  setQueryState<TData>(key: QueryKey, state: QueryState<TData>): void {
    const keyHash = hashKey(key);
    this.cache.set(keyHash, state);
    this.notify(keyHash);
  }

  subscribe(key: QueryKey, listener: QueryListener): () => void {
    const keyHash = hashKey(key);
    const listeners = this.listeners.get(keyHash) ?? new Set<QueryListener>();
    listeners.add(listener);
    this.listeners.set(keyHash, listeners);

    return () => {
      const current = this.listeners.get(keyHash);
      if (current) {
        current.delete(listener);
        if (current.size === 0) {
          this.listeners.delete(keyHash);
        }
      }
    };
  }

  private notify(keyHash: string) {
    const listeners = this.listeners.get(keyHash);
    if (!listeners) return;

    listeners.forEach((listener) => listener());
  }
}

const QueryClientContext = createContext<QueryClient | null>(null);

export const QueryClientProvider: React.FC<PropsWithChildren<{ client: QueryClient }>> = ({ client, children }) => (
  <QueryClientContext.Provider value={client}>{children}</QueryClientContext.Provider>
);

export const useQueryClient = () => {
  const client = useContext(QueryClientContext);

  if (!client) {
    throw new Error('useQueryClient must be used within a QueryClientProvider');
  }

  return client;
};

export const useQuery = <TData, TError = Error>(
  key: QueryKey,
  queryFn: () => Promise<TData>,
  options?: QueryOptions<TData, TError>
): UseQueryResult<TData, TError> => {
  const client = useQueryClient();
  const enabled = options?.enabled ?? true;
  const staleTime = options?.staleTime ?? 0;
  const [state, setState] = useState<QueryState<TData>>(() =>
    client.getQueryState<TData>(key) ?? { status: 'idle', updatedAt: 0 }
  );

  useEffect(() => {
    return client.subscribe(key, () => {
      const nextState = client.getQueryState<TData>(key) ?? { status: 'idle', updatedAt: 0 };
      setState(nextState);
    });
  }, [client, key]);

  const execute = useCallback(async () => {
    if (!enabled) return;

    client.setQueryState<TData>(key, {
      ...state,
      status: 'loading',
      error: undefined,
      updatedAt: Date.now(),
    });

    try {
      const data = await queryFn();
      client.setQueryState<TData>(key, {
        data,
        error: undefined,
        status: 'success',
        updatedAt: Date.now(),
      });
      options?.onSuccess?.(data);
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error));
      client.setQueryState<TData>(key, {
        data: state.data,
        error: normalized,
        status: 'error',
        updatedAt: Date.now(),
      });
      options?.onError?.(normalized as TError);
    }
  }, [client, enabled, key, options, queryFn, state.data]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const current = client.getQueryState<TData>(key);
    if (!current) {
      void execute();
      return;
    }

    if (staleTime === Infinity) {
      return;
    }

    const isStale = Date.now() - current.updatedAt > staleTime;
    if (isStale) {
      void execute();
    } else {
      setState(current);
    }
  }, [client, execute, enabled, key, staleTime]);

  return useMemo(
    () => ({
      data: state.data,
      error: (state.error as TError) ?? null,
      isLoading: state.status === 'loading' && !state.data,
      isFetching: state.status === 'loading',
      isError: state.status === 'error',
      isSuccess: state.status === 'success',
      status: state.status,
      refetch: execute,
    }),
    [execute, state.data, state.error, state.status]
  );
};

export { QueryClient };
