import { Injectable } from '@nestjs/common';

interface SessionEntry {
  connectedAt: Date;
  lastSeen: Date;
}

@Injectable()
export class SessionRegistry {
  private readonly sessions = new Map<string, SessionEntry>();

  register(imei: string): void {
    this.sessions.set(imei, { connectedAt: new Date(), lastSeen: new Date() });
  }

  update(imei: string): void {
    const s = this.sessions.get(imei);
    if (s) s.lastSeen = new Date();
  }

  unregister(imei: string): void {
    this.sessions.delete(imei);
  }

  getAll(): Record<string, SessionEntry> {
    return Object.fromEntries(this.sessions.entries());
  }

  count(): number {
    return this.sessions.size;
  }
}
