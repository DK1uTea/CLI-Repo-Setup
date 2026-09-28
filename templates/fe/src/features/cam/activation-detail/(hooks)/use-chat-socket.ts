'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { dayjs } from '@/lib/date-utils';
import { apiProxy } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChatSender = {
  name: string | null;
  avatar: string | null;
};

export type ChatParent = {
  id: string;
  content: string;
  createdAt?: string;
  sender: ChatSender | null;
};

export type ChatMessage = {
  id: string;
  content: string;
  senderId: string;
  isOwner?: boolean;
  type: string;
  createdAt: string;
  updatedAt: string | null;
  parentId: string | null;
  parent?: ChatParent | null;
  sender: ChatSender | null;
  mentionedUserIds?: string[];
};

export type JumpResult = {
  before: ChatMessage[];
  target: ChatMessage | null;
  after: ChatMessage[];
  hasMoreBefore: boolean;
  hasMoreAfter: boolean;
};

type SendPayload = {
  content: string;
  parentId?: string;
  mentionedUserIds?: string[];
};

type EditPayload = {
  messageId: string;
  content: string;
  mentionedUserIds?: string[];
};

type LoadMorePayload = {
  before?: string;
  after?: string;
};

type UseChatSocketResult = {
  messages: ChatMessage[];
  hasMore: boolean;
  hasMoreAfter: boolean;
  isConnected: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  jumpTargetId: string | null;
  sendMessage: (payload: SendPayload) => void;
  editMessage: (payload: EditPayload) => void;
  loadMore: (payload?: LoadMorePayload) => void;
  jumpToMessage: (messageId: string) => void;
  clearJump: () => void;
  resetToLatest: () => void;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SOCKET_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`;
const SOCKET_PATH = '/cam/socket.io';

const sortMessagesByCreatedAt = (messages: ChatMessage[], direction: 'before' | 'after' | null) => {
  const sorted = [...messages].sort((a, b) => dayjs.utc(a.createdAt).valueOf() - dayjs.utc(b.createdAt).valueOf());

  if (direction === 'before') {
    return sorted;
  }

  return sorted.reverse();
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useChatSocket = (activationId: string | null): UseChatSocketResult => {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const loadDirectionRef = useRef<'before' | 'after' | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [hasMoreAfter, setHasMoreAfter] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [jumpTargetId, setJumpTargetId] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (!activationId) {
      return;
    }

    let active = true;

    const initSocket = async () => {
      try {
        const res = await apiProxy.get<{ data?: { token?: string } }>('/auth/socket-token');
        const token = res?.data?.data?.token || '';
        if (!active) return;

        const socket = io(SOCKET_URL, {
          path: SOCKET_PATH,
          auth: { activationId, token },
          query: { activationId, token },
          transports: ['websocket'],
          upgrade: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          if (active) setIsConnected(true);
        });

        socket.on('disconnect', () => {
          if (active) setIsConnected(false);
        });

    // History: initial load, load-before (older), or load-after (newer)
    socket.on('cam:chat:history', (payload: { data: ChatMessage[]; hasMore: boolean }) => {
      const data = payload?.data ?? [];
      const more = payload?.hasMore ?? false;
      const direction = loadDirectionRef.current;
      const normalizedData = sortMessagesByCreatedAt(data, direction);

      loadDirectionRef.current = null;

      setMessages((prev) => {
        if (prev.length === 0) return normalizedData;

        const existingIds = new Set(prev.map((m) => m.id));
        const fresh = normalizedData.filter((m) => !existingIds.has(m.id));

        if (direction === 'after') {
          // newer messages go to the front (newest-first list)
          return [...fresh, ...prev];
        }

        // older messages (before) go to the end
        return [...prev, ...fresh];
      });

      if (direction === 'after') {
        setHasMoreAfter(more);
      } else {
        setHasMore(more);
      }

      setIsLoading(false);
      setIsLoadingMore(false);
    });

    // New message broadcast — flat list, no nesting
    socket.on('cam:chat:message', (msg: ChatMessage) => {
      queryClient.invalidateQueries({ queryKey: ['cam-activations-grouped'] });
      queryClient.invalidateQueries({ queryKey: ['cam-activation-admin-list'] });
      setIsLoading(false);
      setMessages((prev) => {
        const alreadyExists = prev.some((m) => m.id === msg.id);

        if (alreadyExists) return prev;

        return [msg, ...prev];
      });
    });

    // Edited message broadcast — find and replace by id
    socket.on('cam:chat:edited', (msg: ChatMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, content: msg.content, updatedAt: msg.updatedAt } : m)),
      );
    });

    // Jump-to-message result — only sent to the requesting client
    socket.on('cam:chat:jump-to-message:result', (payload: JumpResult) => {
      const { before, target, after, hasMoreBefore, hasMoreAfter: moreAfter } = payload;

      if (!target) return;

      // Deduplicate target from before/after (server may include it)
      const dedupedBefore = before.filter((m) => m.id !== target.id);
      const dedupedAfter = after.filter((m) => m.id !== target.id);

      // Chronological order: [...before(old→new), target, ...after(old→new)]
      // Reverse to newest-first for display
      const combined: ChatMessage[] = [...dedupedBefore, target, ...dedupedAfter]
        .sort((a, b) => dayjs.utc(a.createdAt).valueOf() - dayjs.utc(b.createdAt).valueOf())
        .reverse();

      setMessages(combined);
      setHasMore(hasMoreBefore);
      setHasMoreAfter(moreAfter);
      setJumpTargetId(target.id);
    });

        socket.on('cam:chat:error', () => {});

        socket.on('connect_error', () => {
          if (active) setIsLoading(false);
        });

        socket.on('error', () => {});
      } catch {
        if (active) setIsLoading(false);
      }
    };

    initSocket();

    return () => {
      active = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsLoading(true);
      setMessages([]);
      setHasMore(false);
      setHasMoreAfter(false);
      setJumpTargetId(null);
    };
  }, [activationId, queryClient]);

  const sendMessage = useCallback((payload: SendPayload) => {
    socketRef.current?.emit('cam:chat:send', payload);
  }, []);

  const editMessage = useCallback((payload: EditPayload) => {
    socketRef.current?.emit('cam:chat:edit', payload);
  }, []);

  const loadMore = useCallback((payload?: LoadMorePayload) => {
    loadDirectionRef.current = payload?.after ? 'after' : 'before';
    setIsLoadingMore(true);
    socketRef.current?.emit('cam:chat:load-more', payload ?? {});
  }, []);

  const jumpToMessage = useCallback((messageId: string) => {
    socketRef.current?.emit('cam:chat:jump-to-message', { messageId });
  }, []);

  const clearJump = useCallback(() => {
    setJumpTargetId(null);
  }, []);

  const resetToLatest = useCallback(() => {
    setMessages([]);
    setHasMoreAfter(false);
    setHasMore(false);
    setIsLoading(true);
    loadDirectionRef.current = null;
    socketRef.current?.emit('cam:chat:load-more', {});
  }, []);

  return {
    messages, hasMore, hasMoreAfter, isConnected, isLoading, isLoadingMore, jumpTargetId,
    sendMessage, editMessage, loadMore, jumpToMessage, clearJump, resetToLatest,
  };
};
