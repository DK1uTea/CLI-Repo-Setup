"use client";

import { useEffect, useRef } from "react";
import { apiProxy } from "@/lib/api";

type SseOptions = {
  onMessage: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
  enabled?: boolean;
};

const RECONNECT_DELAY = 8000;

/**
 * Connects to the CAM SSE notifications stream using fetch (supports auth headers via socket-token).
 * Automatically reconnects on disconnect.
 */
export function useNotificationSse({
  onMessage,
  onError,
  enabled = true,
}: SseOptions) {
  const abortRef = useRef<AbortController | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);

  onMessageRef.current = onMessage;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!enabled) return;

    let destroyed = false;

    const connect = async () => {
      if (destroyed) return;

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const base = process.env.NEXT_PUBLIC_API_BASE_URL;
      const version = process.env.NEXT_PUBLIC_API_VERSION ?? "v1";
      const url = `${base}/notification/api/${version}/inapp/events`;

      try {
        const tokenRes = await apiProxy
          .get<{ data?: { token?: string } }>("/auth/socket-token")
          .catch(() => null);
        const token = tokenRes?.data?.data?.token;

        if (!token) {
          reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY);
          return;
        }

        const response = await fetch(url, {
          signal: abortRef.current.signal,
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok || !response.body) {
          onErrorRef.current?.(new Event("error"));
          reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done || destroyed) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split(/\n\n/);
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const dataLine = part
              .split("\n")
              .find((line) => line.startsWith("data:"));
            if (!dataLine) continue;
            const data = dataLine.replace(/^data:\s*/, "");
            onMessageRef.current(new MessageEvent("message", { data }));
          }
        }

        if (!destroyed)
          reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        onErrorRef.current?.(new Event("error"));
        if (!destroyed)
          reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY);
      }
    };

    connect();

    return () => {
      destroyed = true;
      abortRef.current?.abort();
      abortRef.current = null;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [enabled]);
}
