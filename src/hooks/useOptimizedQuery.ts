
import { useQuery, QueryKey, UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  dependencies?: any[];
}

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  dependencies = [],
  ...options
}: OptimizedQueryOptions<T>) {
  const memoizedQueryKey = useMemo(() => queryKey, dependencies);
  const memoizedQueryFn = useMemo(() => queryFn, dependencies);

  return useQuery({
    queryKey: memoizedQueryKey,
    queryFn: memoizedQueryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    ...options,
  });
}
