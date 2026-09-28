import { registerAs } from '@nestjs/config';
import Joi from 'joi';

export const entraSchema = {
  // Microsoft Entra (Azure AD) application (client) ID — the token audience.
  // Leave empty to disable SSO (the /auth/sso/microsoft endpoint returns NOT_CONFIGURED).
  ENTRA_CLIENT_ID: Joi.string().allow('').default(''),
  // JWKS endpoint used to verify Entra token signatures. `common` works for multi-tenant apps.
  ENTRA_JWKS_URI: Joi.string()
    .uri()
    .default('https://login.microsoftonline.com/common/discovery/v2.0/keys'),
  // JSON array mapping an Entra tenant id (tid) → internal app tenantId. Doubles as the
  // allowlist: only Microsoft tenants listed here may sign in.
  // Example: [{"tid":"<prowerb-tid>","tenantId":"prowerb"},{"tid":"<ccep-tid>","tenantId":"coca-cola"}]
  ENTRA_TENANT_MAPPINGS: Joi.string().allow('').default(''),
  // Comma-separated email domains whose new SSO users are auto-approved (skip the PENDING
  // gate). Everyone else still requires manual admin approval. Example: "prowerb.de,ccep.com"
  ENTRA_AUTO_APPROVE_DOMAINS: Joi.string().allow('').default(''),
};

export interface EntraTenantMapping {
  /** Microsoft Entra tenant id (the `tid` claim). */
  tid: string;
  /** Internal Protrack tenant id this Entra tenant maps to. */
  tenantId: string;
}

export interface IEntraConfig {
  clientId: string;
  jwksUri: string;
  tenantMappings: EntraTenantMapping[];
  /** Email domains (lowercase) whose new SSO users are auto-approved. */
  autoApproveDomains: string[];
  /** True when SSO is fully configured (client id + at least one tenant mapping). */
  isConfigured: boolean;
}

function parseAutoApproveDomains(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter((d) => d.length > 0);
}

function parseTenantMappings(raw: string | undefined): EntraTenantMapping[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is EntraTenantMapping =>
          !!entry && typeof entry.tid === 'string' && typeof entry.tenantId === 'string',
      )
      .map((entry) => ({ tid: entry.tid, tenantId: entry.tenantId }));
  } catch {
    return [];
  }
}

export const entraConfiguration = registerAs('entra', (): IEntraConfig => {
  const clientId = process.env.ENTRA_CLIENT_ID ?? '';
  const tenantMappings = parseTenantMappings(process.env.ENTRA_TENANT_MAPPINGS);

  return {
    clientId,
    jwksUri:
      process.env.ENTRA_JWKS_URI ?? 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
    tenantMappings,
    autoApproveDomains: parseAutoApproveDomains(process.env.ENTRA_AUTO_APPROVE_DOMAINS),
    isConfigured: clientId.length > 0 && tenantMappings.length > 0,
  };
});
