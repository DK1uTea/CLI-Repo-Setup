export const CACHE_KEYS = {
  auth: {
    me: (userId: string) => `auth:me:${userId}`,
    refreshToken: (userId: string, tokenId: string) => `auth:refresh:${userId}:${tokenId}`,
  },
  analytics: {
    ingestion: 'analytics:ingestion',
  },
  settings: {
    unknownDevicePolicyWhitelist: (tenantId: string) =>
      `settings:unknown_device_policy:whitelisted:${tenantId}`,
  },
  device: {
    byImei: (imei: string) => `device:imei:${imei}`,
  },
  position: {
    lastSaved: (deviceId: string) => `position:last-saved:${deviceId}`,
  },
};
