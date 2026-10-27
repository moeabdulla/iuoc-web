"use client";
import { useEffect, useState } from "react";

const cache = new Map<string, unknown>();
export const resourceKey = (urls: string[]) => JSON.stringify(urls);
/** Keep the previous complete reading visible until the next request is ready.
 * Chapter and translation commit together; cancelled responses cannot replace it. */
export function useResource<T>(
  urls: string[],
  initial: { key: string; data: T },
) {
  const key = resourceKey(urls);
  const [result, setResult] = useState(initial);
  const [failure, setFailure] = useState<{ key: string; message: string }>();
  const [attempt, retry] = useState(0);
  useEffect(() => {
    if (result.key === key && !attempt) return;
    const abort = new AbortController();
    const paths = JSON.parse(key) as string[];
    Promise.all(
      paths.map(async (url) => {
        if (cache.has(url)) return cache.get(url);
        const response = await fetch(url, { signal: abort.signal });
        if (!response.ok)
          throw new Error("Unable to load this chapter. Please try again.");
        const data: unknown = await response.json();
        if (!abort.signal.aborted) {
          cache.set(url, data);
          if (cache.size > 24) cache.delete(cache.keys().next().value!);
        }
        return data;
      }),
    )
      .then((data) => {
        if (!abort.signal.aborted) {
          setResult({ key, data: data as T });
          setFailure(undefined);
        }
      })
      .catch((error: Error) => {
        if (!abort.signal.aborted) setFailure({ key, message: error.message });
      });
    return () => abort.abort();
    // `result` is the previous committed reading, not another request trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);
  return {
    data: result.data,
    key: result.key,
    pending: result.key !== key,
    error: failure?.key === key ? failure.message : undefined,
    retry: () => retry((n) => n + 1),
  };
}
