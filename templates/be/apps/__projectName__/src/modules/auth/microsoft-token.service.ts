import { Api400HttpError, Api401HttpError, entraConfiguration } from '@app/core';
import { Inject, Injectable } from '@nestjs/common';
import { createRemoteJWKSet, type JWTPayload, jwtVerify } from 'jose';
import { AUTH_ERROR_CODES } from './constants/auth.error-codes';

export interface EntraIdentity {
  /** Entra object id (stable per user per tenant). */
  oid: string;
  /** Entra tenant id (the `tid` claim). */
  tid: string;
  email: string;
  name: string;
}

/**
 * Verifies Microsoft Entra (Azure AD) ID tokens and extracts the caller's identity.
 * Multi-tenant: any Microsoft organization may issue tokens, but only tenants present
 * in `ENTRA_TENANT_MAPPINGS` are accepted (see resolveTenantId).
 */
@Injectable()
export class MicrosoftTokenService {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet> | null;

  constructor(
    @Inject(entraConfiguration.KEY)
    private readonly entraConfig: ReturnType<typeof entraConfiguration>,
  ) {
    this.jwks = entraConfig.isConfigured ? createRemoteJWKSet(new URL(entraConfig.jwksUri)) : null;
  }

  get isConfigured(): boolean {
    return this.entraConfig.isConfigured;
  }

  /** Maps an Entra tenant id to an internal tenantId, or null if the tenant is not allowlisted. */
  resolveTenantId(tid: string): string | null {
    return this.entraConfig.tenantMappings.find((m) => m.tid === tid)?.tenantId ?? null;
  }

  /** True when the email's domain is on the auto-approve list (new user skips PENDING). */
  isAutoApproveEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    return !!domain && this.entraConfig.autoApproveDomains.includes(domain);
  }

  async verify(idToken: string): Promise<EntraIdentity> {
    if (!this.jwks) throw new Api401HttpError(AUTH_ERROR_CODES.SSO_NOT_CONFIGURED);

    let payload: JWTPayload;
    try {
      // jwtVerify validates signature, expiry and audience (aud === client id).
      ({ payload } = await jwtVerify(idToken, this.jwks, {
        audience: this.entraConfig.clientId,
      }));
    } catch {
      throw new Api401HttpError(AUTH_ERROR_CODES.SSO_INVALID_TOKEN);
    }

    const tid = typeof payload.tid === 'string' ? payload.tid : '';
    const oid = typeof payload.oid === 'string' ? payload.oid : '';
    if (!tid || !oid) throw new Api401HttpError(AUTH_ERROR_CODES.SSO_INVALID_TOKEN);

    // Issuer must match the tenant that claims to have issued the token.
    if (payload.iss !== `https://login.microsoftonline.com/${tid}/v2.0`) {
      throw new Api401HttpError(AUTH_ERROR_CODES.SSO_INVALID_TOKEN);
    }

    const email = this.extractEmail(payload);
    if (!email) throw new Api400HttpError(AUTH_ERROR_CODES.SSO_EMAIL_MISSING);

    const name = typeof payload.name === 'string' && payload.name ? payload.name : email;

    return { oid, tid, email, name };
  }

  private extractEmail(payload: JWTPayload): string {
    for (const claim of [payload.email, payload.preferred_username, payload.upn]) {
      if (typeof claim === 'string' && claim.includes('@')) return claim.toLowerCase();
    }
    return '';
  }
}
