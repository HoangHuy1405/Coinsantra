"use client";

import { useLoadingStore } from "@/lib/loading-store";
import { queryClient } from "@/lib/react-query-client";
import {
  QueryClientProvider,
  useIsFetching,
  useIsMutating,
} from "@tanstack/react-query";
import { useEffect } from "react";

function GlobalReactQueryListener() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const { startLoading, stopLoading } = useLoadingStore();

  useEffect(() => {
    if (isFetching > 0 || isMutating > 0) startLoading();
    else stopLoading();
  }, [isFetching, isMutating, startLoading, stopLoading]);

  return null;
}

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalReactQueryListener />
      {children}
      {/* Optional: DevTools for debugging */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
