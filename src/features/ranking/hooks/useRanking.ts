import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@lib/queryKeys';
import { rankingApi } from '../services/rankingApi';

const PAGE_SIZE = 20;

export function useRanking() {
  const query = useInfiniteQuery({
    queryKey: queryKeys.ranking(),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => rankingApi.listGlobal(pageParam, PAGE_SIZE),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });

  const athletes = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const total = query.data?.pages[0]?.total ?? 0;

  return {
    ...query,
    athletes,
    total,
  };
}
